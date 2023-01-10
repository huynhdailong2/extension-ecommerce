class NgheTruyenMa extends Site {
    static {
        this.domain = "nghetruyenma.net";
        this.category_page_detect = () => { return window.location.href.includes("/the-loai/"); };
        this.post_page_detect = '#zingaudio_container';
        this.accent_page_detect = () => { return window.location.href.includes("nghetruyenma.net/mc-"); };
        this.author_page_detect = () => { return window.location.href.includes("/giong-doc/"); };
    }
    static isPost2() {
        return this.isThis() && $('div[id="audioigniter-]').length > 0;
    }
    static craw() {
        if (this.isCategory()) {
            let categories = [];
            categories = $.map($('.breadcrumb li a').toArray(), function (n, i) {
                return $(n).text().trim();
            });
            categories.shift();
            var description = $('meta[property="og:title"]').attr('content');
            var keywords = $('meta[name="keywords"]').attr('content');
            /*if(description=='' || typeof meta_description == 'undefined'){
                description = og_metadesc
            }*/
            if (description == '' || typeof description == 'undefined') {
                description = ''
            }
            if (keywords == '' || typeof keywords == 'undefined') {
                keywords = ''
            }
            var data_category = {
                description,
                keywords,
                categories,
            };
            console.log('data_category', data_category);
            //get next href
            chrome.runtime.sendMessage(
                {
                    type: 'API_AJAX_POST',
                    url: 'https://nhattruyen.one/api-categories',
                    payload: data_category,
                },
                function (response) {
                    console.log(response);
                    if (response && response.success) {
                        craw_next();
                    }
                });
            //get author
        }
        else if (this.isAuthor()) {
            let name = $('h1.entry-title').text();
            name = name.split(':')[1];
            description = $('meta[name="description"]').attr('content');
            keywords = $('meta[name="keywords"]').attr('content');
            if (description == '' || typeof description == 'undefined') {
                description = ''
            }
            if (keywords == '' || typeof keywords == 'undefined') {
                keywords = ''
            }
            data_category = {
                description,
                keywords,
                name,
            };
            console.log('data_category', data_category);
            //get next href
            chrome.runtime.sendMessage(
                {
                    type: 'API_AJAX_POST',
                    url: 'https://nhattruyen.one/api-authors',
                    payload: data_category,
                },
                function (response) {
                    console.log(response);
                    if (response && response.success) {
                        craw_next();
                    }
                });
        }
        //get accents
        else if (this.isAccent()) {
            let name = $('h1').text();
            let description = $('meta[name="description"]').attr('content');
            if (typeof description == 'undefined') {
                description = '';
            }
            let keywords = '';
            let data_accent = {
                description,
                keywords,
                name,
            };
            console.log('data_accent', data_accent);
            //get next href
            chrome.runtime.sendMessage(
                {
                    type: 'API_AJAX_POST',
                    url: 'https://nhattruyen.one/api-accents',
                    payload: data_accent,
                },
                function (response) {
                    console.log(response);
                    if (response && response.success) {
                        craw_next();
                    }
                });
        }
        else if (this.isPost()) {
            var location_href = window.location.href;
            //meta_description
            let summary = $('meta[name="description"]').attr('content');
            if (typeof summary == 'undefined') {
                summary = $('meta[property="og:description"]').attr('content');
            } if (typeof summary == 'undefined') {
                summary = '';
            }
            //meta keywords
            let keywords = $('meta[name="keywords"]').attr('content');
            if (typeof keywords == 'undefined') {
                keywords = '';
            }
            //title
            let title = $('.col-left h2').text();
            if (typeof title == 'undefined') {
                title = '';
            }
            //post image
            let post_image = $('.col-left .thum-post img').attr('src');
            if (typeof post_image == 'undefined') {
                post_image = '';
            }
            //categories
            let categories = [$('.info-post span:eq(3) a:eq(1)').text()];
            //accent
            let accents = [];
            let row_accent = $('.info-post span:eq(1) a').each(function (index, item) {
                accents.push('MC ' + $(item).text());
            });
            //author
            let author = $('.info-post span:eq(0) a').text();
            author = 'Tác Giả ' + author;
            if (typeof author == 'undefined' || author == '') {
                author = '';
            }
            //content
            let description = '';
            //file_type
            let file_type = "audio";
            //isbn
            let isbn = "1";
            //is_active
            let is_active = "1";
            //tags
            let tags = [];
            $('.tags-product a').each(function (index, item_a) {
                let tag = $(item_a).text();
                tags.push(tag);
            });
            tags = tags.join(',')
            if (typeof tags == "undefined") {
                tags = '';
            }
            var list_mp3 = [];
            let wait_count = 0;
            function waiting_for_ready() {
                return new Promise((resolve, reject) => {
                    function while_loop() {
                        var count_li = $('.jp-playlist ul li').length;
                        var group_mp3 = $('audio#jp_audio_0').attr('src');
                        if (count_li == 0 || typeof group_mp3 == 'undefined' || group_mp3 == '') {
                            setTimeout(() => {
                                wait_count++;
                                console.log('wait_count', wait_count);
                                if (wait_count <= 100) {
                                    while_loop();
                                }
                                else {
                                    reject(false);
                                }
                            }, 150);
                        } else {
                            $('.jp-playlist')[0].scrollIntoView();
                            resolve(count_li);
                        }
                    }
                    while_loop();
                });
            }
            waiting_for_ready().then(function () {
                let group_mp3 = {};
                group_mp3.name = $('audio#jp_audio_0').attr('title');
                group_mp3.mp3 = $('audio#jp_audio_0').attr('src');
                group_mp3.mp3 = encodeURIComponent(group_mp3.mp3)
                list_mp3.push(group_mp3);
                let data_post = {
                    summary,
                    keywords,
                    isbn,
                    title,
                    categories,
                    post_image,
                    content: description,
                    accents,
                    author,
                    is_active,
                    list_mp3,
                    tags,
                    file_type,
                    referer: window.location.href
                };
                console.log('data_post', data_post);
                var queue_count = 0;
                //get next href
                chrome.runtime.sendMessage(
                    {
                        type: 'API_AJAX_POST',
                        url: 'https://nhattruyen.one/api-posts',
                        payload: data_post,
                    },
                    function (response) {
                        console.log(response);
                        if (response && response.success) {
                            var scrollToTop = 0;
                            if (response.fail_audios && response.total_audios && response.fail_audios == 0 && response.total_audios == $('.jp-playlist ul li').length) {
                                craw_next();
                              } else {
                                var loopPostAudio = (postId) => {
                                    if ($('.jp-playlist ul li.jp-playlist-current + li a.jp-playlist-item').length > 0) {
                                        let this_item = $('.jp-playlist ul li.jp-playlist-current + li');
                                        scrollToTop = Math.max(this_item.index() * this_item.outerHeight(), scrollToTop);
                                        $('.jp-playlist ul li.jp-playlist-current + li a.jp-playlist-item')[0].click();
                                        $('.jp-playlist').stop().animate({
                                            scrollTop: scrollToTop
                                        }, 500);
                                        console.log('clicking');
                                        const findNext = () => {
                                            setTimeout(() => {
                                                list_mp3 = [];
                                                group_mp3 = {};
                                                group_mp3.name = $('audio#jp_audio_0').attr('title');
                                                group_mp3.mp3 = $('audio#jp_audio_0').attr('src');
                                                if (group_mp3.mp3 && group_mp3.mp3 != '' && group_mp3.name && group_mp3.name != '' && !list_mp3.includes(group_mp3)) {
                                                    group_mp3.mp3 = encodeURIComponent(group_mp3.mp3)
                                                    list_mp3.push(group_mp3);
                                                    console.log(list_mp3);
                                                    let data_post_audio = {
                                                        post_id: postId,
                                                        list_mp3
                                                    };
                                                    console.log(data_post_audio);
                                                    queue_count++;
                                                    chrome.runtime.sendMessage(
                                                        {
                                                            type: 'API_AJAX_POST',
                                                            url: 'https://nhattruyen.one/api-posts-audio',
                                                            payload: data_post_audio,
                                                        },
                                                        function (response) {
                                                            console.log(response);
                                                            if (response && response.success) {
                                                                queue_count--;
                                                            }
                                                        });
                                                    loopPostAudio(postId);
                                                } else {
                                                    console.log('0000000');
                                                    findNext();
                                                }
                                            }, 300);
                                        };
                                        findNext();
                                    } else {
                                        console.log('queue_count', queue_count);
                                        function queue_wait() {
                                            if (queue_count > 0) {
                                                setTimeout(function () {
                                                    queue_wait();
                                                }, 300);
                                            }
                                            else {
                                                craw_next();
                                            }
                                        }
                                        queue_wait();
                                    }
                                };
                                loopPostAudio(response.post_id);
                            }

                        }else {
                            setTimeout(() => {
                                pushErrorHref(location_href).then(function () { 
                                    craw_next();
                                });
                            }, 2000);
                          }
                    });
            }, function () {
                setTimeout(() => {
                    pushErrorHref(location_href).then(function () {
                      craw_next();
                    });
                  }, 2000);
            });


        }
        else if (this.isPost2()) {
            location_href = window.location.href;
            //meta_description
            let summary = $('meta[name="description"]').attr('content');
            if (typeof summary == 'undefined') {
                summary = $('meta[property="og:description"]').attr('content');
            } if (typeof summary == 'undefined') {
                summary = '';
            }
            //meta keywords
            let keywords = $('meta[name="keywords"]').attr('content');
            if (typeof keywords == 'undefined') {
                keywords = '';
            }
            //title
            let title = $('.col-left h2').text();
            if (typeof title == 'undefined') {
                title = '';
            }
            //post image
            let post_image = $('.col-left .thum-post img').attr('src');
            if (typeof post_image == 'undefined') {
                post_image = '';
            }
            //categories
            let categories = [$('.info-post span:eq(3) a').last().text()];
            //accent
            let accents = [];
            let row_accent = $('.info-post span:eq(1) a').each(function (index, item) {
                accents.push('MC ' + $(item).text());
            });
            //author
            let author = $('.info-post span:eq(0) a').text();
            if (author.includes('Đang Cập Nhập') == true) {
                author = '';
            } else {
                author = 'Tác Giả ' + author;
            }
            if (typeof author == 'undefined' || author == '') {
                author = '';
            }
            //content
            let description = '';
            //file_type
            let file_type = "audio";
            //isbn
            let isbn = "1";
            //is_active
            let is_active = "1";
            //tags
            let tags = [];
            $('.tags-product a').each(function (index, item_a) {
                let tag = $(item_a).text();
                tags.push(tag);
            });
            tags = tags.join(',')
            if (typeof tags == "undefined") {
                tags = '';
            } let list_mp3 = [];
            let json_url = $('.play-audio div.audioigniter-root').attr('data-tracks-url');
            console.log('json_url', json_url);
            const waitForDone = new Promise((resolve, reject) => {
                chrome.runtime.sendMessage(
                    {
                        type: 'API_AJAX_HTML',
                        url: json_url,
                    },
                    function (data) {
                        data.forEach(function (item) {
                            list_mp3 = [];
                            const waitForDoneItem = new Promise((resolveItem, rejectItem) => {
                                let group_mp3 = {};
                                group_mp3.mp3 = item.audio;
                                group_mp3.name = item.title;
                                group_mp3.mp3 = encodeURIComponent(group_mp3.mp3)
                                resolveItem(group_mp3);
                            });
                            waitForDoneItem.then(function (group_mp3) {
                                list_mp3.push(group_mp3);
                                resolve(list_mp3);
                            });
                        });
                    });
                /* $.get(json_url, function (data) {
                    
                }); */
            });
            waitForDone.then(function (list_mp3) {
                let data_post = {
                    summary,
                    keywords,
                    isbn,
                    title,
                    categories,
                    post_image,
                    description,
                    accents,
                    author,
                    is_active,
                    list_mp3,
                    tags,
                    file_type,
                    referer: window.location.href
                };
                console.log('data_post', data_post);
                //get next href
                chrome.runtime.sendMessage(
                    {
                        type: 'API_AJAX_POST',
                        url: 'https://nhattruyen.one/api-posts',
                        payload: data_post,
                    },
                    function (response) {
                        console.log(response);
                        if (response && response.success) {
                            craw_next();
                        }
                    });
            });

        }

    }
}
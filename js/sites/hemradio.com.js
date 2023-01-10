class HemRadio extends Site {
  static {
    this.domain = "hemradio.com";
    this.category_page_detect = '';
    this.post_page_detect = '.ai-audioigniter';
    this.accent_page_detect = '';
    this.author_page_detect = '';
  }
  static isPost2() {
    return this.isThis() && $('.mejs-mediaelement').length > 0;
  }
  static craw() {

    if (this.isPost()) {
      var location_href = window.location.href;
      //meta_description
      let summary = $('meta[property="og:description"]').attr('content');
      if (typeof summary == 'undefined') {
        summary = '';
      }
      //meta keywords
      let keywords = $('meta[name="keywords"]').attr('content');
      if (typeof keywords == 'undefined') {
        keywords = '';
      }
      //title
      let title = $('h1.post-title').text();
      if (typeof title == 'undefined') {
        title = '';
      }
      if (title.includes('|')) {
        title = title.split('|')[0].trim();
      } else {
        title = $('h1.post-title').text();
      }

      //post image
      let post_image = $('.featured-area-inner img').attr('src');
      post_image = post_image.replace(/(https.*?)\?.*/g, '$1');
      if (typeof post_image == 'undefined' || post_image == '') {
        post_image = '';
      }
      //categories
      let categories = [];
      categories = $.map($('#breadcrumb a').toArray(), function (n, i) {
        return $(n).text().trim();
      });
      categories.shift();
      //accent
      let accents = [];
      let row_accent = $('h2.entry-sub-title').each(function (index, item) {
        if ($(item).text().includes(':')) {
          let accent = $(item).text();
          accent = accent.split(':')[1].trim();
          accents.push(accent);
        }
      });
      if (typeof row_accent == 'undefined' || row_accent == '') {
        row_accent = '';
      }
      //author
      let author = $('h1.post-title').text();
      if (author.includes('|')) {
        author = author.split('|')[1].trim();
      }
      if (typeof author == 'undefined' || author == '') {
        author = '';
      }
      //content
      let description = '';
      //file_type
      let file_type = "audio";
      //is_active
      let is_active = "1";
      //tags
      let tags = [];
      $('.tagcloud a[rel="tag"]').each(function (index, item_a) {
        let tag = $(item_a).text();
        tags.push(tag);
      });
      tags = tags.join(',')
      if (typeof tags == "undefined") {
        tags = '';
      }
      //list mp3
      var list_mp3 = [];
      let wait_count = 0;
      function waiting_for_ready() {
        return new Promise((resolve, reject) => {
          function while_loop() {
            var count_li = $('ul.ai-tracklist li.ai-track-active').length;
            var group_mp3 = $('ul.ai-tracklist li.ai-track-active .ai-track-control-buttons a').last().attr('href');
            if (count_li == 0 || typeof group_mp3 == 'undefined' || group_mp3 == '') {
              setTimeout(() => {
                wait_count++;
                console.log('wait_count', wait_count);
                while_loop();
              }, 500);
            } else {
              //$('.jp-playlist')[0].scrollIntoView();
              resolve(count_li);
            }
          }
          while_loop();
        });
      }
      waiting_for_ready().then(function () {
        let group_mp3 = {};
        let group_mp3_name = $('h1.post-title').text();
        if (group_mp3_name.includes('|')) {
          group_mp3_name = group_mp3_name.split('|')[0].trim();
        } else {
          group_mp3_name = $('h1.post-title').text();
        }
        let name_mp3 = $('ul.ai-tracklist li.ai-track-active .ai-track-control .ai-track-name').text();
        let mp3_name = '';
        if (name_mp3.includes(group_mp3_name) == false) {
          mp3_name = group_mp3_name + ' - ' + name_mp3;
        } else {
          mp3_name = $('ul.ai-tracklist li.ai-track-active .ai-track-control .ai-track-name').text();
        }
        group_mp3.name = mp3_name;
        group_mp3.mp3 = $('ul.ai-tracklist li.ai-track-active .ai-track-control-buttons a').last().attr('href');
        group_mp3.mp3 = encodeURIComponent(group_mp3.mp3);
        list_mp3.push(group_mp3);
        $('ul.ai-tracklist li.ai-track-active').addClass('processed');
        let data_post = {
          summary,
          keywords,
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
                  if ($('ul.ai-tracklist li.ai-track:not(.processed)').length > 0) {
                    const findNext = () => {
                      setTimeout(() => {
                        if ($('ul.ai-tracklist li.ai-track:not(.processed)').length > 0) {
                          let item_ai_track = $('ul.ai-tracklist li.ai-track:not(.processed)').first();
                          list_mp3 = [];
                          group_mp3 = {};
                          let mp3_name = $('.ai-track-control .ai-track-name', item_ai_track).text();
                          if (mp3_name.includes(group_mp3_name) == false) {
                            mp3_name = group_mp3_name + ' - ' + mp3_name;
                          } else {
                            mp3_name = $('.ai-track-control .ai-track-name', item_ai_track).text();
                          }
                          group_mp3.name = mp3_name;
                          group_mp3.mp3 = $('.ai-track-control-buttons a', item_ai_track).attr('href');
                          if (group_mp3.mp3 && group_mp3.mp3 != '' && group_mp3.name && group_mp3.name != '' && !list_mp3.includes(group_mp3)) {
                            group_mp3.mp3 = encodeURIComponent(group_mp3.mp3)
                            list_mp3.push(group_mp3);
                            item_ai_track.addClass('processed');
                            console.log(list_mp3);
                            let data_post_audio = {
                              post_id: postId,
                              list_mp3
                            };
                            console.log(data_post_audio);
                            queue_count++;
                            $.post("https://radiotruyen.3tc.vn/api-posts-audio", JSON.stringify(data_post_audio))
                              .done(function (data) {
                                data = JSON.parse(data);
                                if (data && data.success) {
                                  queue_count--;
                                }
                              });
                            loopPostAudio(data.post_id);
                          } else {
                            console.log('0000000');
                            findNext();
                          }
                        }
                      }, 500);
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
                        location.href = curHref;
                      }
                    }
                    queue_wait();
                  }
                };
                loopPostAudio(data.post_id);
              }
            }
          });
      });

    }
    else if (this.isPost2()) {
      //meta_description
      let summary = $('meta[property="og:description"]').attr('content');
      if (typeof summary == 'undefined') {
        summary = '';
      }
      //meta keywords
      let keywords = $('meta[name="keywords"]').attr('content');
      if (typeof keywords == 'undefined') {
        keywords = '';
      }
      //title
      let title = $('h1.post-title').text();
      if (typeof title == 'undefined') {
        title = '';
      }
      if (title.includes('|')) {
        title = title.split('|')[0].trim();
      } else {
        title = $('h1.post-title').text();
      }

      //post image
      let post_image = $('.featured-area-inner img').attr('src');
      post_image = post_image.replace(/(https.*?)\?.*/g, '$1');
      if (typeof post_image == 'undefined' || post_image == '') {
        post_image = '';
      }
      //categories
      let categories = [];
      categories = $.map($('#breadcrumb a').toArray(), function (n, i) {
        return $(n).text().trim();
      });
      categories.shift();
      //accent
      let accents = [];
      let row_accent = $('h2.entry-sub-title').each(function (index, item) {
        if ($(item).text().includes(':')) {
          let accent = $(item).text();
          accent = accent.split(':')[1].trim();
          accents.push(accent);
        }
      });
      if (typeof row_accent == 'undefined' || row_accent == '') {
        row_accent = '';
      }
      //author
      let author = $('h1.post-title').text();
      if (author.includes('|')) {
        author = author.split('|')[1].trim();
      }
      if (typeof author == 'undefined' || author == '') {
        author = '';
      }
      //content
      let description = '';
      //file_type
      let file_type = "audio";
      //is_active
      let is_active = "1";
      //tags
      let tags = [];
      $('.tagcloud a[rel="tag"]').each(function (index, item_a) {
        let tag = $(item_a).text();
        tags.push(tag);
      });
      tags = tags.join(',')
      if (typeof tags == "undefined") {
        tags = '';
      }
      //list_mp3
      let list_mp3 = [];
      let group_mp3 = {};
      let name = $('h1.post-title').text();
      if (name.includes('|')) {
        name = name.split('|')[0].trim();
      }
      group_mp3.name = name;
      let mp3 = $('mediaelementwrapper audio').attr('src');
      if (mp3.includes('mp3?') == true) {
        mp3 = mp3.replace(/(https.*?mp3)\?.*/g, '$1').trim();
      }
      group_mp3.mp3 = mp3;
      list_mp3.push(group_mp3);
      let data_post = {
        summary,
        keywords,
        title,
        categories,
        post_image,
        description,
        accents,
        author,
        is_active,
        tags,
        file_type,
        list_mp3,
        referer: window.location.href
      };
      console.log('data_post', data_post);
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
    }
  }
}
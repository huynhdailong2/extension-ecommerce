function nl2br(str, is_xhtml) {
  if (typeof str === 'undefined' || str === null) {
    return '';
  }
  var breakTag = is_xhtml || typeof is_xhtml === 'undefined' ? '<br />' : '<br>';
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}
$('<link rel="stylesheet" type="text/css" href="' + chrome.runtime.getURL('css/style.css') + '" >').appendTo('head');
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.type == 'RELOAD_MAIN_PAGE') {
    window.location.reload();
  }
});
var nextHref = '';
getBaseUrl = function (url) {
  if (url.indexOf('?') >= 0) {
    return url.substring(0, url.indexOf('?'));
  }
  return url;
};
const getNextHref = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(function (result) {
      if (result && result.urlList) {
        let urlList = Array.isArray(result.urlList) ? result.urlList : [];
        let ignoreList = Array.isArray(result.ignoreList) ? result.ignoreList : [];
        if (urlList.length > 0) {
          let curHref = urlList.shift();
          const url = new URL(curHref);
          var curHref2 = curHref;
          if ((url.pathname.match(/\//g) || []).length == 2) {
            var parts = url.pathname.split('/');
            if (parts[1] != 'giong-doc' && parts[1] != 'tac-gia' && parts[1] != 'the-loai' && parts[1] != 'tag') {
              curHref2 = url.protocol + '//' + url.hostname + '/' + parts[2];
            }
          }
          ignoreList.push(curHref);
          if (curHref != curHref2) {
            ignoreList.push(curHref2);
          }
          chrome.storage.local.set({ curHref }, function () {
            resolve(curHref);
          });
        }
        else {
          resolve('');
        }
      } else {
        resolve('');
      }
    });
  });
}
const pushErrorHref = (url) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(function (result) {
      if (result) {
        let errorList = result.errorList && Array.isArray(result.errorList) ? result.errorList : [];
        errorList.push(url);
        chrome.storage.local.set({ errorList }, function () {
          resolve(url);
        });
      } else {
        resolve('');
      }
    });
  });
}
function craw_next() {
  chrome.storage.local.get(function (result) {
    if (result.mode == 'crawling' || result.mode == 'crawling_all') {
      let urlList = Array.isArray(result.urlList) ? result.urlList : [];
      let ignoreList = Array.isArray(result.ignoreList) ? result.ignoreList : [];
      if (urlList.length > 0) {
        let curHref = urlList.shift();
        console.log('curHref', curHref);
        ignoreList.push(curHref);
        chrome.storage.local.set({ urlList, ignoreList, mode: result.mode, curHref }, function () {
          console.log('success', urlList);
        });

        window.location.href = curHref;
      } else {
        chrome.storage.local.set({ mode: 'done', curHref: undefined }, function () {
          myalert('Đã thêm thành công ' + result.total + ' sản phẩm!');
        });
      }
    } else if (result.mode == 'single-crawling') {
      myalert('Đã thêm sản phẩm thành công!');
    }
  });
}
function runCrawling() {
  if (RadioTruyen.isCrawable()) {
    RadioTruyen.craw();
  } else if (HemTruyenMa.isCrawable()) {
    HemTruyenMa.craw();
  } else if (NgheTruyenMa.isCrawable()) {
    NgheTruyenMa.craw();
  } else if (HemRadio.isPost() || HemRadio.isPost2()) {
    HemRadio.craw();
  } else {
    craw_next();
  }
}
function runCrawlingAll() {
  getAllUrl().then(function () {
    runCrawling();
  });
}
function getAllUrl() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(function (result) {
      let urlList = Array.isArray(result.urlList) ? result.urlList : [];
      let ignoreList = Array.isArray(result.ignoreList) ? result.ignoreList : [];
      let origin = window.location.origin;
      $(`a[href^="${origin}"],a[href]:not(a[href^="http://"],a[href^="https://"],a[href^="#"])`).each(function (index, item_a) {
        let href = $(item_a).attr('href');

        if (!href.startsWith('http')) {
          if (!href.startsWith('/')) {
            href = origin + '/' + href;
          } else {
            href = origin + href;
          }
        }
        if (href.includes('?')) {
          href = href.split('?')[0];
        }
        const url = new URL(href);
        var href2 = href;
        if ((url.pathname.match(/\//g) || []).length == 2) {
          var parts = url.pathname.split('/');
          if (parts[1] != 'giong-doc' && parts[1] != 'tac-gia' && parts[1] != 'the-loai' && parts[1] != 'tag') {
            href2 = url.protocol + '//' + url.hostname + '/' + parts[2];
          }
        }

        if (!urlList.includes(href) && !ignoreList.includes(href) && !urlList.includes(href2) && !ignoreList.includes(href2)) {
          urlList.push(href);
          /* if (href != href2) {
            urlList.push(href2);
          } */
        }
      });
      chrome.storage.local.set({ urlList }, function () {
        resolve(urlList);
      });
    });
  });
}
//Tạo element
const addProductBtn = `<button class="addProductBtn">+</button>`;
const sendProduct = `<div class="sendProductBtn">
<button class="">
<span>0</span>
<i class="icondetail-tickbuy"></i>
</button>
<ul>
<li class="add_this_page">Thêm sp vào hàng đợi</li>
<li class="add_all">Thêm tất cả SP trang này</li>
<li class="remove_this_page">Xóa tất cả SP trang này</li>
<li class="remove_all">Xóa tất cả SP hàng đợi</li>
<li class="crawl_all">Chạy thu thập tất cả trang</li>
</ul>
`;
let urlList = [];
chrome.storage.local.get(function (result) {
  if (result && result.mode) {
    if (result.mode == 'crawling') {
      runCrawling();
    } else if (result.mode == 'crawling_all') {
      runCrawlingAll();
    }
  }
  if (result && result.token) {
    urlList = Array.isArray(result.urlList) ? result.urlList : [];
    let whellTimeout = null;
    $('body').on('pointerup wheel', function () {
      if (whellTimeout != null) {
        clearTimeout(whellTimeout);
      }
      whellTimeout = setTimeout(function () {
        if (window.location.href.match(/dienmayxanh.com/) && $('.listproduct').length > 0) {
          chrome.storage.local.get(function (thisResult) {
            const listProduct = $('.listproduct');
            const listItem = $('.item', listProduct);
            urlList = Array.isArray(thisResult.urlList) ? thisResult.urlList : [];
            listItem.each(function (index, item) {
              $('a[data-id]', item).css('position', 'relative');
              if ($('a[data-id] .addProductBtn', item).length == 0) {
                $('a[data-id]', item).append(addProductBtn);
              }
              if (urlList && urlList.length > 0) {
                const href = $('a[data-id]', item).attr('href');
                if (urlList.includes(href)) {
                  $('.addProductBtn', item).addClass('remove').html('-');
                } else {
                  $('.addProductBtn', item).removeClass('remove').html('+');
                }
              }
            });
          });
        }
      }, 500);
    });
    $('body').on('click', '.addProductBtn', function (e) {
      e.preventDefault();
      const btn = $(this);
      chrome.storage.local.get(function (thisResult) {
        const href = btn.closest('a').attr('href');
        urlList = Array.isArray(thisResult.urlList) ? thisResult.urlList : [];
        if (!btn.hasClass('remove')) {
          console.log('before add', urlList.length, href);
          if (!urlList.includes(href)) {
            urlList.push(href);
            btn.html('-');
            btn.toggleClass('remove', true);
          }
          console.log('after add', urlList.length);
        } else {
          if (urlList.includes(href)) {
            console.log('before remove', urlList.length);
            urlList.splice(urlList.indexOf(href), 1);
            console.log('after remove', urlList.length);
            btn.html('+');
            btn.toggleClass('remove', false);
          }
        }
        chrome.storage.local.set({ urlList }, function () {
          $('.sendProductBtn span').text(urlList.length);
        });
      });
    });

    $('body').append(sendProduct);
    if (urlList && urlList.length > 0) {
      $('.sendProductBtn span').text(urlList.length);
    } else {
      $('.sendProductBtn span').text(0);
    }
    $('.sendProductBtn button').on('click', function (e) {
      e.preventDefault();
      chrome.storage.local.get(function (thisResult) {
        urlList = Array.isArray(thisResult.urlList) ? thisResult.urlList : [];
        if (urlList && urlList.length > 0) {
          console.log('fullList', urlList);
          let confirmQuestion = confirm('Bạn có chắc thêm ' + urlList.length + ' sản phẩm vào website!');
          if (confirmQuestion) {
            let total = urlList.length;
            let curHref = urlList.shift();
            chrome.storage.local.set({ urlList, mode: 'crawling', curHref, total }, function () {
              console.log('success', urlList);
            });

            window.location.href = curHref;
          }
        } else {
          chrome.storage.local.set({ mode: 'single-crawling' }, function () {
            let confirmQuestion = confirm('Bạn có chắc thêm sản phẩm này vào website!');
            if (confirmQuestion) {
              runCrawling();
            }
          });
        }
      });
    });
    $('.sendProductBtn li.remove_all').on('click', function (e) {
      e.preventDefault();
      let confirmQuestion = confirm('Bạn có chắc xóa tất cả liên kết sản phẩm trong hàng đợi!');
      if (confirmQuestion) {
        let all_hrefs = $.map($('.item a[data-id]').toArray(), function (item, index) {
          $('.addProductBtn', item).removeClass('remove').html('+');
          return $(item).attr('href');
        });
        urlList = [];
        chrome.storage.local.set({ urlList }, function () {
          $('.sendProductBtn span').text(0);
        });
      }
    });
    $('.sendProductBtn li.remove_this_page').on('click', function (e) {
      e.preventDefault();
      chrome.storage.local.get(function (thisResult) {
        urlList = Array.isArray(thisResult.urlList) ? thisResult.urlList : [];
        let confirmQuestion = confirm('Bạn có chắc xóa tất cả liên kết sản phẩm trong trang khỏi hàng đợi!');
        if (confirmQuestion) {
          $('.item a[data-id]').each(function (index, item) {
            $('.addProductBtn', item).removeClass('remove').html('+');
            let href = $(item).attr('href');
            if (urlList.includes(href)) {
              urlList.splice(urlList.indexOf(href), 1);
            }
          });

          chrome.storage.local.set({ urlList }, function () {
            $('.sendProductBtn span').text(urlList.length);
          });
        }
      });
    });
    $('.sendProductBtn li.add_this_page').on('click', function (e) {
      e.preventDefault();
      console.log('add_this_page');
      chrome.storage.local.get(function (thisResult) {
        urlList = Array.isArray(thisResult.urlList) ? thisResult.urlList : [];
        if (RadioTruyen.isPost() || NgheTruyenMa.isPost() || NgheTruyenMa.isPost2() || HemTruyenMa.isPost() || HemRadio.isPost() || HemRadio.isPost2()) {
          let href = window.location.href;
          console.log(href);
          if (!urlList.includes(href)) {
            urlList.push(href);
          }
        }
        chrome.storage.local.set({ urlList }, function () {
          $('.sendProductBtn span').text(urlList.length);
          $('.sendProductBtn ul').toggleClass('hidden', true);
          setTimeout(() => {
            $('.sendProductBtn ul').toggleClass('hidden', false);
          }, 300);
        });
      });
    });
    $('.sendProductBtn li.add_all').on('click', function (e) {
      e.preventDefault();
      let confirmQuestion = confirm('Bạn có chắc thêm tất cả liên kết sản phẩm trong trang vào hàng đợi!');
      if (confirmQuestion) {
        var viewMoreTimeout = null;

        function runViewMore() {
          viewMoreTimeout = setTimeout(function () {
            //dienmayxanh
            if ($('.view-more a').is(':visible')) {
              if ($('.view-more a:not(.prevent)').length > 0 && $('.view-more a').is(':visible')) {
                $('.view-more a:not(.prevent)')[0].click();
              }
              $('html, body')
                .stop()
                .animate(
                  {
                    scrollTop: $('.view-more a').offset().top,
                  },
                  500
                );
              runViewMore();
            } else {
              if (viewMoreTimeout != null && typeof viewMoreTimeout != 'undefined') {
                chrome.storage.local.get(function (thisResult) {
                  urlList = Array.isArray(thisResult.urlList) ? thisResult.urlList : [];
                  let origin = window.location.origin;
                  $(`a[href^="${origin}"],a[href]:not(a[href^="http://"],a[href^="https://"],a[href^="#"])`).each(function (index, item_a) {
                    $('.addProductBtn', item_a).addClass('remove').html('-');
                    let href = $(item_a).attr('href');
                    console.log(href);
                    if (!urlList.includes(href)) {
                      urlList.push(href);
                    }
                  });
                  chrome.storage.local.set({ urlList }, function () {
                    $('.sendProductBtn span').text(urlList.length);
                    console.log('🚀 ~ file: content.js ~ line 3087 ~ urlList', urlList);
                  });
                });
                clearTimeout(viewMoreTimeout);
              }
            }
          }, 500);
        }
        runViewMore();
      }
    });
    $('.sendProductBtn li.crawl_all').on('click', function (e) {
      e.preventDefault();
      let confirmQuestion = confirm('Bạn có chắc chạy thu thập tất cả liên kết sản phẩm trong trang web này!');
      if (confirmQuestion) {
        getAllUrl().then(function (urlList) {
          console.log('test');
          let curHref = urlList.shift();
          chrome.storage.local.set({ urlList, ignoreList: [], mode: 'crawling_all', curHref }, function () {
            $('.sendProductBtn span').text(urlList.length);
          });
          window.location.href = curHref;
        });
      }
    });
  }
});

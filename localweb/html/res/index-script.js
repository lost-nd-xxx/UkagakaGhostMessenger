document.addEventListener('DOMContentLoaded', () => {
  let previousData = {};

  // const getQueryParams = () => {
  //   const params = new URLSearchParams(window.location.search);
  //   return {
  //     sender: params.get('sender'),
  //     sender_id: params.get('sender_id')
  //   };
  // };

// <a class="personLink" href="./person.html?sender=hoge&sender_id=fuga">
//   <div class="personContainer">
//     <img class="personIcon" alt="うめちゃん" src="./res/image/うめちゃん/umechan_icon.png">
//     <div class="personText">
//       <p class="personName">うめちゃん＠UGM</p>
//       <p class="personMessage">おなかがぺこちゃんだよぉ～</p>
//     </div>
//     <p class="personTime">2024/06/23 16:00</p>
//   </div>
// </a>
// <hr>

  const fetchData = () => {
    fetch('./res/data.json')
      .then(response => response.json())
      .then(item => {
        if (JSON.stringify(item) !== JSON.stringify(previousData)) {
          if (item.length > 0) {
            // 後でまとめて差し替える
            const doc = document.documentElement;
            // ブロック状態
            const normal_accounts = item.filter(i => i.block_flag === 0);
            const muted_accounts = item.filter(i => i.mute_flag != 0 );
            const blocked_accounts = item.filter(i => i.block_flag != 0 );
            // ぶん回す
            normal_accounts.forEach(acct => {
              let elem = document.createElement('a');
              elem.querySelector('a').setAttribute('class','personLink');
              elem.querySelector('a').setAttribute('href','./person.html?sender='+acct.sender+'&sender_id='+acct.SenderId);

              elem.querySelector('a').appendChild(document.createElement('div'));
              elem.querySelector('a>div').setAttribute('class','personContainer');

              elem.querySelector('a>div').appendChild(document.createElement('img'));
              elem.querySelector('a>div>img').setAttribute('class','personIcon');
              elem.querySelector('a>div>img').setAttribute('alt',acct.SenderName);
              elem.querySelector('a>div>img').setAttribute('src',acct.SenderIcon);

              elem.querySelector('a>div').appendChild(document.createElement('div'));
              elem.querySelector('a>div>div').setAttribute('class','personText');
              
              elem.querySelector('a>div>div').appendChild(document.createElement('p'));
              elem.querySelector('a>div>div>p').setAttribute('class','personName');
              elem.querySelector('a>div>div>p').innerText = acct.SenderName;
              
              elem.querySelector('a>div>div').appendChild(document.createElement('p'));
              elem.querySelector('a>div>div>p:nth-child(2)').setAttribute('class','personMessage');
              let newer_msg = acct.msgs.at(-1).innerHTML;
              if ( newer_msg.length<= 0 ) {
                newer_msg =  acct.msgs.at(-1).alt;
              } else {
                newer_msg = newer_msg.replaceAll( /\<.*?alt\=\"(.*?)\".*?\>/g, ':$1:' );
                newer_msg = newer_msg.replaceAll( /\<.*?\>/g, '' );
              }
              elem.querySelector('a>div>div>p:nth-child(2)').innerText = newer_msg;
              


            });


            // アイコンのimgタグ
            doc.querySelector('.profileIcon').setAttribute('alt', item.SenderName);
            doc.querySelector('.profileIcon').setAttribute('src', item.SenderIcon);
            // プロフィールの名前欄
            doc.querySelector('.profileName').innerText = item.SenderName;
            doc.querySelector('.profileIcon').setAttribute('alt', item.SenderName);
            // プロフィールの文章欄
            doc.querySelector('.profileText').innerHTML = `<p>${item.SenderProfile}</p>`;
            // メッセージを並べていく
            var msgs = document.createElement('div');
            let arr = item.msgs;
            arr.forEach((element) => {
              switch (element.type) {
                case 'kiritori':
                  let kiritori = document.createElement('div');
                  kiritori.setAttribute('class', 'kiritoriLine');
                  kiritori.innerHTML = `<p>${element.time}</p>`;
                  msgs.appendChild(kiritori);
                  break;
                case 'stamp':
                  let stamp = document.createElement('div');
                  stamp.setAttribute('class', 'messageContainer');
                  stamp.innerHTML = `
                    <img class="messageIcon" alt="${item.SenderName}" src="${item.SenderIcon}">
                    <img class="stamp" alt="${element.alt}" src="${element.src}">
                    <p class="messageTime">${element.time}</p>
                  `;
                  msgs.appendChild(stamp);
                  break;
                default:
                  let bubble = document.createElement('div');
                  bubble.setAttribute('class', 'messageContainer');
                  bubble.innerHTML = `
                    <img class="messageIcon" alt="${item.SenderName}" src="${item.SenderIcon}">
                    <div class="messageBubble"><p>${element.innerHTML}</p></div>
                    <p class="messageTime">${element.time}</p>
                  `;
                  msgs.appendChild(bubble);
                  break;
              }
            });
            doc.getElementsByClassName('contentContainer')[0].innerHTML = msgs.innerHTML;
            // 書き換えたものをまとめて差し替え
            document.getElementsByTagName('html')[0] = doc;
            // 前回との比較用データを更新
            previousData = data;
            // 既読情報をプラグインに送る
            (async () => {
              await new Promise(() => {
                let fmo = jsstp.get_fmo_infos();
              }).then((fmo) => {
                jsstp.SEND({
                  "ID": fmo.keys[0],
                  "Script": "\\![notifyplugin,6f0415e0-3c00-11ef-9a9c-0800200c9a66,OnUkagakaGhostMessenger_MarkAsRead," + item.sender + "," + item.SenderId + "]\\e"
                });
              });
            });
          } else {
            // 見つからなかった場合
            // ページタイトル
            document.getElementsByTagName('title')[0].innerText = 'UkagakaGhostMessenger エラー';
            // 中身 シンプル
            document.getElementsByTagName('body')[0].innerHTML = `
            <h1>アカウントを見つけられませんでした</h1>
            <div class="center_text"><p><a href="./index.html">
              前の頁に戻る際は、この文字列をクリックしてください。
            </a></p></div>
            <div class="footer"><div class="footerContainer"><p>UkagakaGhostMessenger</p></div></div>
            `;
          }
        }
      })
      .catch(error => console.error('Error loading JSON data:', error));
  };

  const updateHtml = async () => {
    await new Promise((resolve) => {
      fetchData();
      resolve();
    }).then(() => {
      let fuwaimg = document.createElement('script');
      fuwaimg.setAttribute('src', './res/fuwaimg/js/fuwaimg.js');
      fuwaimg.setAttribute('id', 'fuwaimg_js');
      document.getElementById('js_module').appendChild(fuwaimg);
    }).then(() => {
      // ちょっと待ってから最下部へスクロール
      setTimeout(function () {
        window.scrollBy(0, window.innerHeight);
      }, 500);

    });
  };

  // 初回データ取得
  updateHtml();

  // 定期的にデータを再取得（2秒ごとに）
  setInterval(fetchData(), 2000);
});

document.getElementById('downloadLink').addEventListener('click', function (event) {
  event.preventDefault(); // デフォルトのリンク動作を防止

  // 画像をBase64データURLに変換する関数
  function fetchImageAsBase64(url) {
    return fetch(url).then(response => response.blob()).then(blob => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function () {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    });
  }

  function inlineImageLinks(doc) {
    const imageLinkElements = doc.querySelectorAll('a[class="fuwaimg"]');
    const promises = [];

    imageLinkElements.forEach(a => {
      promises.push(fetchImageAsBase64(a.href).then(dataUrl => {
        a.href = dataUrl;
      }));
    });

    return Promise.all(promises);
  }

  function inlineImages(doc) {
    const imageElements = doc.querySelectorAll('img[src]');
    const promises = [];

    // 画像をBase64データURLとしてインライン化
    imageElements.forEach(img => {
      promises.push(fetchImageAsBase64(img.src).then(dataUrl => {
        img.src = dataUrl;
      }));
    });

    return Promise.all(promises);
  }

  function inlineCSS(doc) {
    const linkElements = doc.querySelectorAll('link[rel="stylesheet"]');
    const promises = [];

    linkElements.forEach(link => {
      const href = link.href;
      promises.push(fetch(href).then(response => response.text()).then(cssText => {
        const urlRegex = /url\(([^)]+)\)/g;
        const matches = cssText.matchAll(urlRegex);
        const urlPromises = [];

        for (const match of matches) {
          let url = match[1].replace(/["']/g, ''); // 引用符を削除
          if (url.startsWith('./')) {
            url = new URL(url, href).href;
          }
          urlPromises.push(
            fetchImageAsBase64(url).then(dataUrl => {
              cssText = cssText.replace(match[1], `"${dataUrl}"`);
            })
          );
        }

        return Promise.all(urlPromises).then(() => {
          const style = doc.createElement('style');
          style.textContent = cssText;
          link.replaceWith(style);
        });
      }));
    });

    return Promise.all(promises);
  }

  function inlineScripts(doc) {
    const scriptElements = doc.querySelectorAll('#fuwaimg_js');
    const promises = [];

    scriptElements.forEach(script => {
      const src = script.src;
      promises.push(fetch(src).then(response => response.text()).then(scriptText => {
        const inlineScript = doc.createElement('script');
        inlineScript.textContent = scriptText;
        script.replaceWith(inlineScript);
      }));
    });

    return Promise.all(promises);
  }

  // 現在のHTMLを取得し、DOMパーサーで解析
  var parser = new DOMParser();
  var doc = parser.parseFromString(document.documentElement.outerHTML, 'text/html');
  // 保存用HTMLから要素を削除
  let elementToRemove = doc.querySelector('sidebar');
  if (elementToRemove) {
    elementToRemove.remove();
  }
  elementToRemove = doc.getElementById('fetchJs');
  if (elementToRemove) {
    elementToRemove.remove();
  }
  elementToRemove = doc.getElementById('jsstp_mjs');
  if (elementToRemove) {
    elementToRemove.remove();
  }

  // 画像、CSS、スクリプトをインライン化して保存
  inlineImages(doc).then(() => {
    return inlineImageLinks(doc);
  }).then(() => {
    return inlineCSS(doc);
  }).then(() => {
    return inlineScripts(doc);
  }).then(() => {

    // 修正されたHTMLを文字列として取得
    var modifiedHtml = doc.documentElement.outerHTML;

    // Blobオブジェクトを作成し、HTMLファイルとして保存
    let blob = new Blob([modifiedHtml], { type: 'text/html' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    let date = new Date();
    let year = date.getFullYear().toString().padStart(4, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    let hour = date.getHours().toString().padStart(2, '0');
    let minute = date.getMinutes().toString().padStart(2, '0');
    let second = date.getSeconds().toString().padStart(2, '0');
    let dateText = year + month + day + hour + minute + second;
    a.download = SenderName + dateText + '.html';
    document.body.appendChild(a);
    a.click();

    // リンクを削除
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});

document.getElementById('settings').addEventListener('click', function (event) {
  event.preventDefault(); // デフォルトのリンク動作を防止
  // はいどあんどしーく
  const visible = document.querySelectorAll('.sidebar .h_n_s.visible');
  if (visible.length > 0) {
    visible.forEach(visible => {
      visible.setAttribute('class', 'h_n_s');
    });
    document.querySelectorAll('#settings img')[0].setAttribute('src', './res/svg/settings.svg');
    document.querySelectorAll('#settings p')[0].innerText = '管理・設定';
  } else {
    const hidden = document.querySelectorAll('.sidebar .h_n_s');
    hidden.forEach(hidden => {
      hidden.setAttribute('class', 'h_n_s visible');
    });
    document.querySelectorAll('#settings img')[0].setAttribute('src', './res/svg/collapse_all.svg');
    document.querySelectorAll('#settings p')[0].innerText = 'たたむ';
  }

});

document.getElementById('setting_mute').addEventListener('click', function (event) {
  event.preventDefault(); // デフォルトのリンク動作を防止

});



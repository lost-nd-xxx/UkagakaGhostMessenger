// 更新されたかの比較用
let previousData;
// 情報格納用
let item;

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    sender: params.get('sender'),
    sender_id: params.get('sender_id')
  };
};

function rewriteHtml(data) {
  const params = getQueryParams();
  // 後でまとめて差し替える
  let doc = document.querySelector('html');
  if (data.at(0).unread_count_all > 99) {
    // 新着がいっぱいある
    doc.querySelector('#unreadBadge').removeAttribute('class');
    doc.querySelector('#unreadCount').innerText = '99+';
  } else if (data.at(0).unread_count_all > 0) {
    // 新着がある
    doc.querySelector('#unreadBadge').removeAttribute('class');
    doc.querySelector('#unreadCount').innerText = data.at(0).unread_count_all;
  } else {
    // 新着が無い
    doc.querySelector('#unreadBadge').setAttribute('class', 'hns_hidden');
    doc.querySelector('#unreadCount').innerText = '';
  }
  // 情報を探して変数に入れる
  item = data.filter(i => i.sender === params.sender).find(i => i.SenderId === params.sender_id);
  if (Object.keys(item).length > 0) {
    // ページタイトル
    let title = 'UkagakaGhostMessenger ' + item.SenderName + 'とのトーク履歴';
    doc.querySelector('title').textContent = title;
    // アイコンのimgタグ
    doc.querySelector('.profileIcon').setAttribute('alt', item.SenderName);
    doc.querySelector('.profileIcon').setAttribute('src', item.SenderIcon);
    // プロフィールの名前欄
    doc.querySelector('.profileName').textContent = item.SenderName;
    doc.querySelector('.profileIcon').setAttribute('alt', item.SenderName);
    // プロフィールの文章欄
    doc.querySelector('.profileText>p').innerText = item.SenderProfile.replaceAll(/\<br\>/g, '\n');
    // ミュートボタンを状態に応じて差し替え
    if (item.mute_flag !== 0) {
      doc.querySelector('#setting_mute>.navIcon').setAttribute('src', './res/svg/volume_off.svg');
      doc.querySelector('#setting_mute>.navIcon').setAttribute('alt', '通知オンにする');
      doc.querySelector('#setting_mute>.navItemText').textContent = '通知オンにする';
    } else {
      doc.querySelector('#setting_mute>.navIcon').setAttribute('src', './res/svg/volume_up.svg');
      doc.querySelector('#setting_mute>.navIcon').setAttribute('alt', '通知オフにする');
      doc.querySelector('#setting_mute>.navItemText').textContent = '通知オフにする';
    }
    // ブロックボタンを状態に応じて差し替え
    if (item.block_flag !== 0) {
      doc.querySelector('#setting_block>.navIcon').setAttribute('src', './res/svg/account_circle_off.svg');
      doc.querySelector('#setting_block>.navIcon').setAttribute('alt', 'ブロック解除する');
      doc.querySelector('#setting_block>.navItemText').textContent = 'ブロック解除する';
    } else {
      doc.querySelector('#setting_block>.navIcon').setAttribute('src', './res/svg/account_circle.svg');
      doc.querySelector('#setting_block>.navIcon').setAttribute('alt', 'ブロックする');
      doc.querySelector('#setting_block>.navItemText').textContent = 'ブロックする';
    }
    // メッセージを並べていく
    var msgs = document.createElement('div');
    msgs.setAttribute('class', 'contentContainer');
    let arr = item.msgs;
    arr.forEach((element) => {
      switch (element.type) {
        case 'kiritori':
          let kiritori = document.createElement('div');
          kiritori.setAttribute('class', 'kiritoriLine');
          kiritori.appendChild(document.createElement('p'));
          kiritori.querySelector('p').textContent = element.time;
          msgs.appendChild(kiritori);
          break;
        case 'stamp':
          let stamp = document.createElement('div');
          stamp.setAttribute('class', 'messageContainer');
          stamp.appendChild(document.createElement('img'));
          stamp.querySelector('img').setAttribute('class', 'messageIcon');
          stamp.querySelector('.messageIcon').setAttribute('alt', item.SenderName);
          stamp.querySelector('.messageIcon').setAttribute('src', item.SenderIcon);
          stamp.appendChild(document.createElement('img'));
          stamp.querySelector('img:last-child').setAttribute('class', 'stamp');
          stamp.querySelector('.stamp').setAttribute('alt', element.alt);
          stamp.querySelector('.stamp').setAttribute('src', element.src);
          stamp.appendChild(document.createElement('p'));
          stamp.querySelector('p').setAttribute('class', 'messageTime');
          stamp.querySelector('.messageTime').textContent = element.time;
          msgs.appendChild(stamp);
          break;
        default:
          let bubble = document.createElement('div');
          bubble.setAttribute('class', 'messageContainer');
          bubble.appendChild(document.createElement('img'));
          bubble.querySelector('img').setAttribute('class', 'messageIcon');
          bubble.querySelector('.messageIcon').setAttribute('alt', item.SenderName);
          bubble.querySelector('.messageIcon').setAttribute('src', item.SenderIcon);
          bubble.appendChild(document.createElement('div'));
          bubble.querySelector('div').setAttribute('class', 'messageBubble');
          bubble.querySelector('.messageBubble').appendChild(document.createElement('p'));
          bubble.querySelector('.messageBubble>p').innerHTML = element.text;
          bubble.appendChild(document.createElement('p'));
          bubble.querySelector('.messageIcon~p').setAttribute('class', 'messageTime');
          bubble.querySelector('.messageTime').innerText = element.time;
          msgs.appendChild(bubble);
          break;
      }
    });
    doc.querySelector('.contentContainer').replaceWith(msgs);
    // 書き換えたものをまとめて差し替え
    document.querySelector('html').replaceWith(doc);
    // 既読用スクリプトを定義
    const send_script = `\\C\\![notifyplugin,6f0415e0-3c00-11ef-9a9c-0800200c9a66,OnUkagakaGhostMessenger_MarkAsRead,"${item.sender}","${item.SenderId}"]`
    // 既読情報を送信
    send_jsstp(send_script);
    return 1;
  } else {
    errorHtml();
    console.error('rewriteHtml:失敗');
  }
};

function fetchData() {
  fetch('./res/data.json', { cache: "no-store" })
    .then(response => response.json())
    .then(data => {
      let rewrited = 0;
      if (JSON.stringify(data) !== JSON.stringify(previousData)) {
        rewrited = rewriteHtml(data);
        // 前回との比較用データを更新
        previousData = data;
      }
      return rewrited;
    })
    .then((rewrited) => {
      if (rewrited === 1) {
        // fuwaimgを適用する
        loadFuwaimg();
      }
    })
    .catch(error => {
      errorHtml();
      console.error('fetchData:失敗', error);
    });
};

function errorHtml() {
  // 現在の内容を取得
  let bodyhtml = document.querySelector('html');
  // ページタイトル
  bodyhtml.querySelector('title').textContent = 'UkagakaGhostMessenger エラー';
  // 不要なものを削除
  bodyhtml.querySelector('.header').remove();
  bodyhtml.querySelector('.contentContainer').remove();
  bodyhtml.querySelector('#modal_container').remove();
  bodyhtml.querySelector('#fuwaimg').remove();
  // 本文
  bodyhtml.querySelector('.main').prepend(document.createElement('p'));
  bodyhtml.querySelector('.main>p').setAttribute('class', 'notice_text');
  bodyhtml.querySelector('.main>p.notice_text').appendChild(document.createElement('a'));
  bodyhtml.querySelector('.main>p.notice_text>a').setAttribute('href', './index.html');
  bodyhtml.querySelector('.main>p.notice_text>a').textContent = '一覧に移動する場合、この文字列をクリックしてください。';
  // 題字要素
  bodyhtml.querySelector('.main').prepend(document.createElement('h1'));
  bodyhtml.querySelector('h1').textContent = 'エラーが発生しました';
  // 差し替え実行
  document.querySelector('html').replaceWith(bodyhtml);
  // 非表示になっているのを表示に切り替え
  document.querySelector('body').setAttribute('class', 'hns_visible');
  // 繰り返し取得を解除
  clearInterval(check_update);
};

async function loadFuwaimg() {
  try {
    const timestamp = new Date().getTime();
    await import(`./fuwaimg/js/fuwaimg.js?timestamp=${timestamp}`);
  } catch (error) {
    console.error('fuwaimgのインポートに失敗しました:', error);
  }
};

// 繰り返し設定用の変数定義
async function updateHtml() {
  try {
    fetchData();
    // ちょっと待ってから最下部へスクロール
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "instant"
      });
    }, 100);
    setTimeout(() => {
      fetchData();
    }, 1000);
    // 定期的にデータを再取得
    check_update = setInterval(() => {
      fetchData();
    }, 10000);
  }
  catch (error) {
    errorHtml();
    console.error('updateHtml:失敗', error);
  };
};

document.addEventListener('DOMContentLoaded', () => {
  // 初回データ取得
  updateHtml();
});

document.getElementById('downloadLink').addEventListener('click', function (event) {
  // デフォルトのリンク動作を防止
  event.preventDefault();

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
    const promises = [];

    const src = './res/fuwaimg/js/fuwaimg.js'
    promises.push(fetch(src)
      .then(response => response.text())
      .then(scriptText => {
        const inlineScript = doc.createElement('script');
        inlineScript.setAttribute('id', 'fuwaimg_js');
        inlineScript.textContent = scriptText;
        doc.querySelector('#js_module').appendChild(inlineScript);
      }));

    return Promise.all(promises);
  }

  // 現在のHTMLを取得し、DOMパーサーで解析
  var parser = new DOMParser();
  var doc = parser.parseFromString(document.documentElement.outerHTML, 'text/html');
  // 保存用HTMLから要素を削除
  let elementToRemove = doc.querySelector('.nav-content');
  if (elementToRemove) {
    elementToRemove.remove();
  }
  elementToRemove = doc.querySelector('.navBtnSpace');
  if (elementToRemove) {
    elementToRemove.remove();
  }
  elementToRemove = doc.querySelectorAll('script:not(#fuwaimg_js)');
  if (elementToRemove) {
    Array.from(elementToRemove).forEach((elem) => {
      elem.remove();
    })
  }
  elementToRemove = doc.querySelector('link[rel="icon"]');
  if (elementToRemove) {
    elementToRemove.remove();
  }

  // 画像、CSS、スクリプトをインライン化して保存
  inlineImages(doc).then(() => {
    return inlineCSS(doc);
  }).then(() => {
    return inlineScripts(doc);
  }).then(() => {
    return inlineImageLinks(doc);
  }).then(() => {

    // 修正されたHTMLを文字列として取得
    const modifiedHtml = doc.documentElement.outerHTML;

    // Blobオブジェクトを作成し、HTMLファイルとして保存
    const blob = new Blob([modifiedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date();
    const year = date.getFullYear().toString().padStart(4, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    const dateText = year + month + day + hour + minute + second;
    a.download = item.SenderName + dateText + '.html';
    document.body.appendChild(a);
    a.click();

    // リンクを削除
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});

document.getElementById('settings').addEventListener('click', (event) => {
  // デフォルトのリンク動作を防止
  event.preventDefault();
  // はいどあんどしーく
  const visible = document.querySelectorAll('.setting_btn.hns_visible');
  if (visible.length > 0) {
    visible.forEach(visible => {
      visible.setAttribute('class', 'setting_btn hns_hidden');
    });
    document.querySelector('#settings img').setAttribute('src', './res/svg/settings.svg');
    document.querySelector('#settings p').innerText = '管理・設定';
  } else {
    const hidden = document.querySelectorAll('.setting_btn.hns_hidden');
    hidden.forEach(hidden => {
      hidden.setAttribute('class', 'setting_btn hns_visible');
    });
    document.querySelector('#settings img').setAttribute('src', './res/svg/collapse_all.svg');
    document.querySelector('#settings p').innerText = 'たたむ';
  }
});

document.querySelectorAll('.setting_btn').forEach(element => {
  element.addEventListener('click', (event) => {
    // デフォルトのリンク動作を防止
    event.preventDefault();

    // 説明文
    const explanation = document.createElement('div');
    explanation.setAttribute('id', 'modal_explanation');
    switch (element.id.substring(8)) {
      case 'mute':
        if (item.mute_flag === 0) {
          explanation.appendChild(document.createElement('p'));
          explanation.querySelector('p').textContent = item.SenderName + 'からのメッセージ通知を非表示にしますか？';
          explanation.appendChild(document.createElement('ul'));
          explanation.querySelector('ul').appendChild(document.createElement('li'));
          explanation.querySelector('ul>li:last-child').textContent = '非表示中もメッセージは受信し続けます';
        } else {
          explanation.appendChild(document.createElement('p'));
          explanation.querySelector('p').textContent = item.SenderName + 'からのメッセージ通知非表示を解除しますか？';
          explanation.appendChild(document.createElement('ul'));
          explanation.querySelector('ul').appendChild(document.createElement('li'));
          explanation.querySelector('ul>li:last-child').textContent = 'メッセージ受信時に通知が出るようになります';
        }
        break;
      case 'block':
        if (item.block_flag === 0) {
          explanation.appendChild(document.createElement('p'));
          explanation.querySelector('p').textContent = item.SenderName + 'からのメッセージをブロックしますか？';
          explanation.appendChild(document.createElement('ul'));
          explanation.querySelector('ul').appendChild(document.createElement('li'));
          explanation.querySelector('ul>li:last-child').textContent = 'ブロック中はメッセージが受信されません';
        } else {
          explanation.appendChild(document.createElement('p'));
          explanation.querySelector('p').textContent = item.SenderName + 'のブロックを解除しますか？';
          explanation.appendChild(document.createElement('ul'));
          explanation.querySelector('ul').appendChild(document.createElement('li'));
          explanation.querySelector('ul>li:last-child').textContent = 'メッセージが受信されるようになります';
        }
        break;
      case 'log_delete':
        explanation.appendChild(document.createElement('p'));
        explanation.querySelector('p').textContent = item.SenderName + 'のメッセージ履歴を全て削除しますか？';
        explanation.appendChild(document.createElement('ul'));
        explanation.querySelector('ul').appendChild(document.createElement('li'));
        explanation.querySelector('ul>li:last-child').textContent = '通知停止・ブロックの状態には影響しません';
        break;
      case 'address_delete':
        explanation.appendChild(document.createElement('p'));
        explanation.querySelector('p').textContent = item.SenderName + 'を連絡先から削除しますか？';
        explanation.appendChild(document.createElement('ul'));
        explanation.querySelector('ul').appendChild(document.createElement('li'));
        explanation.querySelector('ul>li:last-child').textContent = 'メッセージ履歴もすべて消えます';
        explanation.querySelector('ul').appendChild(document.createElement('li'));
        explanation.querySelector('ul>li:last-child').textContent = '通知停止・ブロックはオフになります';
        break;
      default:
        explanation.querySelector('p').textContent = '未定義のボタンが押されました';
        break;
    }
    // モーダルウィンドウを表示
    const set_modal = async () => {
      await new Promise((resolve) => {
        // 全体
        let doc = document.querySelector('#modal_container');
        doc.setAttribute('class', 'hns_visible')
        // 定義しておいた説明文
        doc.querySelector('#modal_explanation').replaceWith(explanation);
        // ボタン類が非表示になっていたら戻す
        doc.querySelector('#modal_btns').removeAttribute('class');
        doc.querySelector('#modal_exec').removeAttribute('class');
        doc.querySelector('#modal_exit').removeAttribute('class');
        // 「する」ボタン
        if (explanation.textContent.includes('未定義のボタンが押されました') === true) {
          doc.querySelector('#modal_exec').setAttribute('class', 'hns_hidden');
        } else {
          doc.querySelector('#modal_exec').setAttribute('class', element.id);
          doc.querySelector('#modal_exec').textContent = 'する';
        }
        // 「しない」ボタン
        if (explanation.textContent.includes('未定義のボタンが押されました') === false) {
          doc.querySelector('#modal_exit').textContent = 'しない';
        } else {
          doc.querySelector('#modal_exit').textContent = '戻る';
        }
        document.querySelector('body').setAttribute('class', 'modal_body hns_visible');
        document.querySelector('#modal_container').replaceWith(doc);
        resolve();
      });
    };
    set_modal();
  });
});

document.querySelector('#modal_exit').addEventListener('click', (event) => {
  // バブリングを停止
  event.stopPropagation();
  // デフォルトのリンク動作を防止
  event.preventDefault();
  // 実行したかもしれないイベント  
  const key = document.querySelector('#modal_exec').getAttribute('class');
  // 成功したかどうか
  const success = document.querySelector('#modal_exit').className;
  // モーダルを隠す
  document.querySelector('#modal_exec').setAttribute('class', 'hns_hidden');
  document.querySelector('#modal_container').setAttribute('class', 'hns_hidden');
  document.querySelector('body').setAttribute('class', 'hns_visible');

  if (key.includes('address_delete') && success === 'success') {
    const a = document.createElement('a');
    a.href = './index.html';
    a.id = 'redirect';
    document.querySelector('body').appendChild(a);
    document.querySelector('#redirect').click();
  } else if (success === 'success') {
    // データが書き換わっているかもなので、ちょっと待ってから再描画
    setTimeout(() => {
      fetchData();
    }, 100);
  };
});

async function send_jsstp(script) {
  // jsstpが使えるかどうか
  const jsstp_avaiable = await jsstp.available();
  if (jsstp_avaiable === false) {
    return 0;
  }
  // fmoが使えるかどうか
  const fmo = await jsstp.get_fmo_infos();
  if (fmo.avaiable === false) {
    return 0;
  }

  for (let i = 0; i < fmo.keys.length; i++) {
    // 送信データを定義
    const send_data = { "ID": fmo.keys[i], "Script": script, "Event": "OnUkagakaGhostMessenger_SendToPlugin" };
    // 送信
    const result = await jsstp.SEND(send_data);
    console.log('jsstp_log: ' + result.head);
    switch (result.status_code) {
      case 200:
        return 1;
      case 204:
        return 1;
      case 400:
        return 0;
      case 500:
        return 0;
      case 512:
        if (i === fmo.keys.length) {
          // 次のゴーストがいないので最小化である旨を返す
          return 2;
        } else {
          // 最小化中なので次のゴーストを試行
          break;
        }
      default:
        return result.status_code;
    }
  }
}

document.querySelector('#modal_exec').addEventListener('click', (event) => {
  // バブリングを停止
  event.stopPropagation();
  // デフォルトのリンク動作を防止
  event.preventDefault();
  // 現在のモーダルを取得
  const modal_window = document.querySelector('#modal_window');
  // 送るイベント名
  const clicked = modal_window.querySelector('#modal_exec').getAttribute('class');
  // 通信時間切れを定義
  const timeout = setTimeout(() => {
    if (clicked === 'callingGhostExec') {
      modal_window.querySelector('#modal_explanation>p').textContent = '呼び出しに時間がかかりすぎています。';
    } else {
      modal_window.querySelector('#modal_explanation>p').textContent = '通信に時間がかかりすぎています。';
    }
    modal_window.querySelector('#modal_exit').textContent = '中止する';
    document.querySelector('#modal_window').replaceWith(modal_window);
  }, 10000);
  // 通信失敗時の変更を定義
  const send_failure = (error) => {
    clearTimeout(timeout);
    console.error('modal_exec:通信に失敗/' + clicked, error);
    modal_window.querySelector('#modal_explanation>p').textContent = 'ベースウェアとの通信に失敗しました。';
    modal_window.querySelector('#modal_exit').textContent = '戻る';
    document.querySelector('#modal_window').replaceWith(modal_window);
  };
  // 最小化されていた通信失敗時の変更を定義
  const send_invisible = (error) => {
    clearTimeout(timeout);
    console.error('modal_exec:通信に失敗/' + clicked, error);
    modal_window.querySelector('#modal_explanation>p').textContent = '通信に失敗しました。ゴーストが最小化されています。';
    modal_window.querySelector('#modal_exit').textContent = '戻る';
    document.querySelector('#modal_window').replaceWith(modal_window);
  };
  // 通信成功時の変更を定義
  const send_success = () => {
    clearTimeout(timeout);
    if (clicked === 'callingGhostExec') {
      modal_window.querySelector('#modal_explanation>p').textContent = '呼び出しを完了しました。';
    } else {
      modal_window.querySelector('#modal_explanation>p').textContent = '操作を完了しました。';
    }
    modal_window.querySelector('#modal_exit').setAttribute('class', 'success');
    modal_window.querySelector('#modal_exit').textContent = '戻る';
    document.querySelector('#modal_window').replaceWith(modal_window);
  };
  // 通信が謎の時の変更を定義
  const send_unknown = (result) => {
    clearTimeout(timeout);
    console.info('modal_exec:通信返答が' + result + '/' + clicked);
    if (clicked === 'callingGhostExec') {
      modal_window.querySelector('#modal_explanation>p').innerText = '応答は' + result + 'でした。\n呼び出しに失敗している可能性があります。';
    } else {
      modal_window.querySelector('#modal_explanation>p').innerText = '応答は' + result + 'でした。\n操作は未完了の可能性があります。';
    }
    modal_window.querySelector('#modal_exit').textContent = '戻る';
    document.querySelector('#modal_window').replaceWith(modal_window);
  };

  async function setting_exec() {
    try {
      // send_script の初期化
      let send_script = '';
      modal_window.querySelector('#modal_explanation>p').setAttribute('class', 'notice_text');
      modal_window.querySelector('#modal_explanation>p').textContent = '通信中です...';
      if (modal_window.querySelector('#modal_explanation>ul') != null) {
        modal_window.querySelector('#modal_explanation>ul').setAttribute('class', 'hns_hidden');
      };
      modal_window.querySelector('#modal_exec').setAttribute('class', document.querySelector('#modal_exec').getAttribute('class') + ' hns_hidden');
      modal_window.querySelector('#modal_exit').textContent = '中止';
      document.querySelector('#modal_window').replaceWith(modal_window);

      if (clicked === 'callingGhostExec') {
        send_script = `\\C\\![notifyplugin,6f0415e0-3c00-11ef-9a9c-0800200c9a66,OnCallingGhost]\\![call,ghost,"${item.sender}"]`;
      } else {
        send_script = `\\C\\![notifyplugin,6f0415e0-3c00-11ef-9a9c-0800200c9a66,OnUkagakaGhostMessenger_SettingsFromWeb,${clicked},"${item.sender}","${item.SenderId}"]`;
      };
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('タイムアウト')), 10000)
      )
      const result = await Promise.race([send_jsstp(send_script), timeoutPromise]);
      switch (result) {
        case 2:
          send_invisible();
          break;
        case 1:
          send_success();
          break;
        case 0:
          send_failure();
          break;
        default:
          send_unknown(result);
      }
    } catch (error) {
      console.error('setting_execでエラー', error);
      send_failure();
    };
  };
  setting_exec();
});

document.querySelector('#modal_container').addEventListener('click', (event) => {
  // バブリングを停止
  event.stopPropagation();
  // デフォルトのリンク動作を防止
  event.preventDefault();
  // モーダルを隠す
  document.querySelector('#modal_container').setAttribute('class', 'hns_hidden');
  document.querySelector('body').setAttribute('class', 'hns_visible');
  // 実行したかもしれないイベント  
  const key = document.querySelector('#modal_exec').getAttribute('class');
  // 成功したかどうか
  const success = document.querySelector('#modal_exit').className;
  if (key.includes('address_delete') && success === 'success') {
    const a = document.createElement('a');
    a.href = './index.html';
    a.id = 'redirect';
    document.querySelector('body').appendChild(a);
    document.querySelector('#redirect').click();
  } else if (success === 'success') {
    // データが書き換わっているかもなので、ちょっと待ってから再描画
    setTimeout(() => {
      fetchData();
    }, 100);
  };
});

document.querySelector('#callGhost').addEventListener('click', (event) => {
  // バブリングを停止
  event.stopPropagation();
  // デフォルトのリンク動作を防止
  event.preventDefault();
  // 説明文
  const explanation = document.createElement('div');
  explanation.setAttribute('id', 'modal_explanation');
  explanation.appendChild(document.createElement('p'));
  explanation.querySelector('p').textContent = item.sender + 'を呼び出しますか？';
  // モーダルウィンドウを表示
  const set_modal = async () => {
    await new Promise((resolve) => {
      // 全体
      let doc = document.querySelector('#modal_container');
      doc.setAttribute('class', 'hns_visible')
      // 定義しておいた説明文
      doc.querySelector('#modal_explanation').replaceWith(explanation);
      // ボタン類が非表示になっていたら戻す
      doc.querySelector('#modal_btns').removeAttribute('class');
      doc.querySelector('#modal_exec').removeAttribute('class');
      doc.querySelector('#modal_exit').removeAttribute('class');
      // 「する」ボタン
      doc.querySelector('#modal_exec').textContent = '呼び出す';
      doc.querySelector('#modal_exec').setAttribute('class', 'callingGhostExec');
      // 「しない」ボタン
      doc.querySelector('#modal_exit').textContent = '呼び出さない';

      document.querySelector('body').setAttribute('class', 'modal_body hns_visible');
      document.querySelector('#modal_container').replaceWith(doc);
      resolve();
    });
  };
  set_modal();
});

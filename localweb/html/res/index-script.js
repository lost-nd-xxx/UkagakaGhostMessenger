// 更新されたかの比較用
let previousData;

function rewriteHtml(item) {
  // おやすみボタンを状態に応じて変える
  let oyasumi_btn = document.querySelector('#oyasumi_toggle');
  let oyasumi = item.filter(i => 'oyasumi_flag' in i)[0];
  if ( oyasumi.oyasumi_flag === 1 ) {
    oyasumi_btn.querySelector('.navIcon').setAttribute('src','./res/svg/notifications_paused.svg');
    oyasumi_btn.querySelector('.navItemText').textContent = 'おやすみモード無効化';
  } else {
    oyasumi_btn.querySelector('.navIcon').setAttribute('src','./res/svg/notifications_active.svg');
    oyasumi_btn.querySelector('.navItemText').textContent = 'おやすみモード有効化';
  }
  document.querySelector('#oyasumi_toggle').replaceWith(oyasumi_btn);
  // リストを表示状態に応じて変える
  let list_btn = document.querySelector('#list_type_change').className.substring(5);
  let account_list = item;
  account_list = account_list.filter(i => 'sender' in i);
  switch (list_btn) {
    case 'block':
      account_list = account_list.filter(i => i.block_flag !== 0);
      break;
    case 'mute':
      account_list = account_list.filter(i => i.mute_flag !== 0);
      break;
    case 'all':
      // 全部なので絞り込み不要
      break;
    case 'default':
      account_list = account_list.filter(i => i.block_flag === 0);
      break;
    default:
      account_list = account_list.filter(i => i.block_flag === 0);
      break;
  }
  // 入れ物用の空要素を作っておく
  let elem = document.createElement('div');
  elem.setAttribute('id', 'addressContainer');
  if (item.length === 0) {
    // かたまり
    let child = document.createElement('div');
    child.setAttribute('class', 'personLink');
    elem.appendChild(child);
    // 表示名
    child = document.createElement('p');
    child.setAttribute('class', 'center_text');
    child.textContent = '何も記録されていません';
    elem.querySelector('.personLink').appendChild(child);
  } else if (account_list.length === 0) {
    // かたまり
    let child = document.createElement('div');
    child.setAttribute('class', 'personLink');
    elem.appendChild(child);
    // 表示名
    child = document.createElement('p');
    child.setAttribute('class', 'center_text');
    child.textContent = '該当する項目がありませんでした';
    elem.querySelector('.personLink').appendChild(child);
  } else {
    account_list.forEach((acct, index, array) => {
      // 最初以外ならhrを入れる
      if (index > 0) { elem.appendChild(document.createElement('hr')); }
      if (array.length === 0) {
      } else {
        // リンクのかたまり
        let child = document.createElement('a');
        child.setAttribute('class', 'personLink');
        child.setAttribute('href', './person.html?sender=' + acct.sender + '&sender_id=' + acct.SenderId);
        elem.appendChild(child);
        // div
        child = document.createElement('div');
        child.setAttribute('class', 'personContainer');
        elem.querySelector('.personLink:last-child').appendChild(child);
        // アイコン
        child = document.createElement('img');
        child.setAttribute('class', 'personIcon');
        child.setAttribute('alt', acct.SenderName);
        child.setAttribute('src', acct.SenderIcon);
        elem.querySelector('.personLink:last-child .personContainer').appendChild(child);
        // div
        child = document.createElement('div');
        child.setAttribute('class', 'personText');
        elem.querySelector('.personLink:last-child .personContainer').appendChild(child);
        // 表示名
        child = document.createElement('p');
        child.setAttribute('class', 'personName');
        child.textContent = acct.SenderName;
        elem.querySelector('.personLink:last-child .personText').appendChild(child);
        // メッセージのプレビュー　略される
        child = document.createElement('p');
        child.setAttribute('class', 'personMessage');
        let latest_msg = [];
        if (acct.msgs.length>0) {
          latest_msg = acct.msgs.at(-1);
        }
        if ('text' in latest_msg) {
          latest_msg = latest_msg.text;
        } else if ('alt' in latest_msg) {
          latest_msg = latest_msg.alt;
        } else {
          latest_msg = '';
        }
        child.innerText = latest_msg;
        elem.querySelector('.personLink:last-child .personText').appendChild(child);
        // 時刻
        child = document.createElement('p');
        child.setAttribute('class', 'personTime');
        const date = new Date(acct.time_count * 1000);
        const year = date.getFullYear().toString().padStart(4, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        const dateText = `${year}/${month}/${day} ${hour}:${minute}`;
        child.innerText = dateText;
        elem.querySelector('.personLink:last-child .personContainer').appendChild(child);
      }
    });
  }
  // 出力
  document.querySelector('#addressContainer').replaceWith(elem);
}

function fetchData() {
  fetch('./res/data.json', { cache: "no-store" })
    .then(response => response.json())
    .then(data => {
      if (JSON.stringify(data) !== JSON.stringify(previousData)) {
        rewriteHtml(data);
        // 前回との比較用データを更新
        previousData = data;
        return 1;
      } else {
        return 0;
      }
    })
    .catch(error => {
      errorHtml();
      console.error('fetchData:失敗', error);
      return -1;
    });
}

function errorHtml() {
  // ページタイトル
  document.querySelector('title').textContent = 'UkagakaGhostMessenger エラー';
  // 中身
  let bodyhtml = document.createElement('body');
  bodyhtml.appendChild(document.createElement('h1'));
  bodyhtml.querySelector('h1').textContent = 'データを見つけられませんでした';
  bodyhtml.appendChild(document.createElement('p'));
  bodyhtml.querySelector('p').setAttribute('class', 'center_text');
  bodyhtml.querySelector('p').textContent = 'このページを閉じて、ベースウェア本体からプラグインを操作しなおしてください。';
  bodyhtml.appendChild(document.createElement('div'));
  bodyhtml.querySelector('div').setAttribute('class', 'footer');
  bodyhtml.querySelector('.footer').appendChild(document.createElement('div'));
  bodyhtml.querySelector('.footer>div').setAttribute('class', 'footerContainer');
  bodyhtml.querySelector('.footer>.footerContainer').appendChild(document.createElement('p'));
  bodyhtml.querySelector('.footer>.footerContainer>p').textContent = 'UkagakaGhostMessenger';
  document.querySelector('body').replaceWith(bodyhtml);
};

// 繰り返し設定用の変数定義
let check_update;
function updateHtml() {
  try {
    fetchData();
    document.querySelector('#oyasumi_toggle').setAttribute('class', 'hns_visible');
    document.querySelector('#addressContainer').setAttribute('class', 'hns_visible');
    let fuwaimg = document.createElement('script');
    fuwaimg.setAttribute('src', './res/fuwaimg/js/fuwaimg.js');
    fuwaimg.setAttribute('id', 'fuwaimg_js');
    document.querySelector('#js_module').appendChild(fuwaimg);
    // 定期的にデータを再取得
    if (!check_update) {
      check_update = setInterval(() => {
        fetchData();
      }, 10000);
    }
  } catch (error) {
    console.error('updateHtml:失敗', error);
    errorHtml();
    clearInterval(check_update);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // 初回データ取得
  updateHtml();
});

document.querySelector('#list_type_change').addEventListener('click', (event) => {
  // デフォルトのリンク動作を防止
  event.preventDefault();
  try {
    // リスト切り替えの文字を状態に応じて差し替え
    const list_type = document.querySelector('#list_type_change').className.substring(5);
    let list_btn = document.querySelector('#list_type_change');
    switch (list_type) {
      case 'block':
        list_btn.setAttribute('class', 'list_mute');
        list_btn.querySelector('.navItemText').textContent = '表示条件：ミュート中';
        break;
      case 'mute':
        list_btn.setAttribute('class', 'list_all');
        list_btn.querySelector('.navItemText').textContent = '表示条件：全て';
        break;
      case 'all':
        list_btn.setAttribute('class', 'list_default');
        list_btn.querySelector('.navItemText').textContent = '表示条件：通常';
        break;
      case 'default':
        list_btn.setAttribute('class', 'list_block');
        list_btn.querySelector('.navItemText').textContent = '表示条件：ブロック中';
        break;
      default:
        list_btn.setAttribute('class', 'list_default');
        list_btn.querySelector('.navItemText').textContent = '表示条件：通常';
        break;
    }
    document.querySelector('#list_type_change').replaceWith(list_btn);
    rewriteHtml(previousData);
  } catch (error) {
    console.error('list_type_change:失敗', error);
  }
});

document.querySelector('#oyasumi_toggle').addEventListener('click', (event) => {
  // デフォルトのリンク動作を防止
  event.preventDefault();
  // スクリプトを定義
  const send_script = `\\![raiseplugin,6f0415e0-3c00-11ef-9a9c-0800200c9a66,OnUkagakaGhostMessenger_SettingsFromWeb,oyasumi_toggle]\\e`
  // 情報を送信
  async function send_exec() {
    let send_result = await send_jsstp(send_script);
    if (send_result===1) {
      // おやすみボタンも状態に応じて変える
      let oyasumi_btn = document.querySelector('#oyasumi_toggle');
      let oyasumi = document.querySelector('#oyasumi_toggle .navItemText').textContent;
      if ( oyasumi === 'おやすみモード有効化' ) {
        oyasumi_btn.querySelector('.navIcon').setAttribute('src','./res/svg/notifications_paused.svg');
        oyasumi_btn.querySelector('.navItemText').textContent = 'おやすみモード無効化';
      } else {
        oyasumi_btn.querySelector('.navIcon').setAttribute('src','./res/svg/notifications_active.svg');
        oyasumi_btn.querySelector('.navItemText').textContent = 'おやすみモード有効化';
      }
      document.querySelector('#oyasumi_toggle').replaceWith(oyasumi_btn);
    }
  }
  send_exec();
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

  // 送信データを定義
  const send_data = { "ID": fmo.keys[0], "Script": script };

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
      // 最小化中
      return 0;
    default:
      return result.status_code;
  }
}
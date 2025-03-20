// ==UserScript==
// @name     SuperPixiv
// @version  12
// @match    https://www.pixiv.net/*
// @updateURL https://github.com/Tina-otoge/SuperPixiv/raw/master/super-pixiv.user.js
// ==/UserScript==

const PROXY_URL = 'https://pximg.perennialte.ch';

async function insert_viewer(id) {
  const viewer = document.createElement("div");
  viewer.style.cssText = `
    height: 100vh;
    width: calc(100vw - 200px);
    position: fixed;
    top: 0;
    left: 100px;
    background: rgba(0,0,0,.8);
    display: flex;
    flex-direction: column;
    padding-top: 60px;
    overflow: scroll;
    cursor: zoom-out;
  `;

  document.body.appendChild(viewer);
  document.body.style.overflow = 'hidden';
    

  viewer.onclick = () => {
    document.body.removeChild(viewer);
    document.body.style.overflow = 'initial';
  };

  async function load_data() {
    let meta = await fetch(`https://www.pixiv.net/ajax/illust/${id}?lang=en`);
    meta = await meta.json();
    meta = meta.body;
    console.log(meta);
    const tags = [];
    meta.tags.tags.forEach(tag => {
      if (tag.translation)
        tags.push(tag.translation.en);
      else if (tag.romaji)
        tags.push(tag.romaji);
      else
        tags.push(tag.tag);
    });
    const meta_tag = document.createElement('div');
    meta_tag.innerHTML = `
			<p>${meta.illustTitle} by ${meta.userName} on ${meta.createDate}</p>
			<p>${tags.join(", ")}</p>
			<p>View: ${meta.viewCount} | Bookmarks: ${meta.bookmarkCount} | Comments: ${meta.commentCount} | Pages: ${meta.pageCount}</p>
		`;
    if (meta.aiType == 2) {
      meta_tag.innerHTML += `
      	<p style="color: red; font-weight: bold">AI Generated</p>
    	`
    }
    meta_tag.style.cssText = `
      text-align: center;
      color: white;
      text-shadow: 1px 1px 2px black;
      line-height: 1.5;
      width: 100%;
      position: fixed;
      top: 0;
    `;
    viewer.appendChild(meta_tag);
    
    if (meta.illustType == 2) {
      const video = document.createElement("video");
      const id = meta.illustId;
      const prefix = "0" + id.slice(0, 3);
      video.src = `https://i.ugoira.com/mp4/${prefix}/${id}.mp4`;
      video.autoplay = true;
      video.controls = true;
      video.loop = true;
      video.style.cssText = `
      	max-width: calc(100% - 100px);
        max-height: calc(90% - 200px);
        margin: 0;
        position: relative;
        left: 50px;
        cursor: default;
      `;
      viewer.appendChild(video);
    } else {
      let pages = await fetch(`https://www.pixiv.net/ajax/illust/${id}/pages?lang=en`);
      pages = await pages.json();
      pages = pages.body;
      pages.forEach(o => {
        const img = document.createElement("img");
        img.src = o.urls.regular;
        img.style.cssText = `
          margin: 1rem auto;
          max-width: 90%;
          max-height: calc(100vh - 100px);
        `;
        viewer.appendChild(img);
      });
    }
  }
  load_data();
}

function _detect_and_attach(doc) {
  doc.querySelectorAll('[data-gtm-value], .relative a').forEach(illust => {
    if (illust.dataset.viewer)
      return;
    illust.dataset.viewer = true;
    if (illust.getAttribute('data-gtm-context'))
        return;
    const container = illust.parentElement;
//  causes viewer to not work on artist pages, disabling until I figure out why I added this check
//     if (container.children.length != 3)
//       return;
    container.style.position = 'relative';
    const link = illust.tagName == "a" ? illust : container.querySelector('a');
    if (!link)
      return;
    if (!link.href.includes("/artworks/"))
      return;
    let id = link.getAttribute('data-gtm-value');
    if (!id) {
      id =  link.href.split("/")[4];
    }
    const button = document.createElement('div');
    button.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 60%;
      cursor: zoom-in;
		`;
    container.appendChild(button);
    button.onclick = (e) => {
      insert_viewer(id);
    };
  });
}

function detect_and_attach() {
  _detect_and_attach(document);
  for (const el of document.querySelectorAll("pixiv-infinite-scroll"))
    _detect_and_attach(el.shadowRoot);
}

function setup_proxy() {
  const ORIGINAL_URL = 'https://i.pximg.net';
  document.querySelectorAll('img').forEach(img => {
    if (!img.src.startsWith(ORIGINAL_URL))
      return;
    console.log(`Replacing ${img.src} -> ${PROXY_URL}`);
    img.src = PROXY_URL + img.src.slice(ORIGINAL_URL.length);
  });
}

setInterval(detect_and_attach, 500);
setInterval(setup_proxy, 500);

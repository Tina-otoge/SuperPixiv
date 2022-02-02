// ==UserScript==
// @name     SuperPixiv
// @version  1
// @match    https://www.pixiv.net/*
// ==/UserScript== 


async function insert_viewer(id) {
  const viewer = document.createElement("div");
  viewer.style.cssText = `
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    background: rgba(0,0,0,.8);
		display: flex;
		flex-direction: column;
		padding: 0 3rem;
		overflow: scroll;
  `;

  document.body.appendChild(viewer);
  
  viewer.onclick = () => {
    document.body.removeChild(viewer);
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
			<p>${meta.illustTitle} by ${meta.userName}</p>
			<p>Date: ${meta.createDate}</p>
			<p>${tags.join(", ")}</p>
			<p>View: ${meta.viewCount} | Bookmarks: ${meta.bookmarkCount} | Comments: ${meta.commentCount}</p>
		`;
    meta_tag.style.textAlign = 'center';
    meta_tag.style.color = 'white';
    meta_tag.style.lineHeight = 1.5;
    viewer.appendChild(meta_tag);
    let pages = await fetch(`https://www.pixiv.net/ajax/illust/${id}/pages?lang=en`);
    pages = await pages.json();
    pages = pages.body;
    pages.forEach(o => {
    	const img = document.createElement("img");
      img.src = o.urls.regular;
      img.style.cssText = `
				margin: 3rem auto;
				max-width: 90%;
				max-height: 90%;
			`;
      viewer.appendChild(img);
    });
  }
  load_data();
}

function detect_and_attach() {
  const galleries = document.querySelectorAll("[class^='gtm-']");
  galleries.forEach(gallery => {
    gallery.querySelectorAll('li').forEach(li => {
      if (li.dataset.viewer)
        return;
      li.dataset.viewer = true;
      li.style.position = 'relative';
      const link = li.querySelector('a');
      const id = link.getAttribute('data-gtm-value');
      const button = document.createElement('div');
      button.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 60%;
      `;
      li.querySelector('div').appendChild(button);
      button.onclick = (e) => {
        insert_viewer(id);
      };
    });
  });
}

function detect_and_attach2() {
  document.querySelectorAll('[type="illust"]').forEach(illust => {
    if (illust.dataset.viewer)
      return;
    illust.dataset.viewer = true;
    const container = illust.parentElement;
    if (container.children.length != 3)
      return;
    container.style.position = 'relative';
    const link = container.querySelector('a');
    const id = link.getAttribute('data-gtm-value');
    const button = document.createElement('div');
    button.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 60%;
		`;
    container.appendChild(button);
    button.onclick = (e) => {
      insert_viewer(id);
    };
  });
}

setInterval(detect_and_attach2, 500);

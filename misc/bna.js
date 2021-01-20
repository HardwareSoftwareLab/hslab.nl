"use strict";

// fuck javascript

const main = function() {
	// @Banner_Support_Sizes
	const supported_sizes = ["_512x128", "_128x512", "_128x64"];

	// the site can be online on hslab.nl
	// or on localhost, which could point directly to the hslab.nl folder
	// or to a folder that contains a hslab.nl folder
	// or it can be named hslab.nl-master.
	// We have this complexity here so:
	// A) it's more easy for students to do the setup
	// B) we can change domain later and only have to deal with the pain here
	// C) it deals with the different ways people are using localhost

	const origin = (function() {
		
		if (document.location.href.includes('hslab.nl')) {
			return document.location.href.substring(0, document.location.href.indexOf('hslab.nl')+8);	
		}
		else {
			return document.location.origin;
		}
	})();


	let hover_descriptions = null;

	fetch(origin+"/misc/hover_descriptions.json")
		.then(response => response.json())
		.then(json => {
			hover_descriptions = json;
			fetch(origin+"/misc/banners.json")
				.then(response => response.json())
				.then(json => load_banners(json));
		}
	);


	function load_banners(json) {

		const db = window.localStorage;

		for (let i = 0; i < supported_sizes.length; i++) {
			const size = supported_sizes[i];

			const width  = parseInt(size.substring(1, size.indexOf("x")));
			const height = parseInt(size.substring(size.indexOf("x")+1));

			const banners = json[size];
			const banner_containers = document.getElementsByClassName("banners"+size);

			let banner_index = db.getItem('banner_index'+size);
			if (banner_index == null) {
				// we don't want the choosen banner on a first visit to be the same for 
				// everyone cause then it will get biased towards one project.
				banner_index = Math.floor(Math.random()*banners.length);
			}
			
			for (let i = 0; i < banner_containers.length; i++) {

				let banner_data = banners[ banner_index % banners.length ];

				// avoid banners that point to the site we are already on
				if (`/${banner_data["site"]}/` == document.location.pathname) {
					banner_index++;
					i--;
					continue;
				}

				let href = origin+"/"+banner_data["site"];
				let all_img_urls = banner_data["banners"];
				let random_img_url = origin+"/"+banner_data["site"]+"/"+all_img_urls[Math.floor(Math.random()*all_img_urls.length)];

				// we also allow .mp4 since it is a way better format then .gif, but it has to be in a <video> element instead of <img>.
				const is_mp4 = random_img_url.endsWith(".mp4");
				if (is_mp4) {
					banner_containers[i].innerHTML = 
						`<a href="${href}" title="${hover_descriptions[banner_data["site"]]}"> \
							<video width="${width}" height="${height}" autoplay loop muted> \
								<source src="${random_img_url}" type="video/mp4"> \
							</video>
						</a>`;
				}
				else {
					banner_containers[i].innerHTML = 
						`<a href="${href}" title="${hover_descriptions[banner_data["site"]]}">` +
							`<img src="${random_img_url}" width="${width}" height="${height}">`+
						`</a>`;
				}
				banner_containers[i].style["width"] = `${width}px`;
				banner_containers[i].style["height"] = `${height}px`;
				banner_containers[i].classList.add("banner");
				banner_index++;
			}

			db.setItem('banner_index'+size, banner_index);
		}	
	}


	var sheet = document.createElement('style')
	sheet.innerHTML = 
		`.banner {
			border: 1px solid black;
		}`;
	document.body.appendChild(sheet);
}


window.addEventListener("DOMContentLoaded", function() {
	main();
});


"use strict";

// fuck javascript


const create_banner_for_container = function(container, href, hover_description, img_url, width, height) {

	// we also allow .mp4 since it is a way better format then .gif, but it has to be in a <video> element instead of <img>.
	const is_mp4 = img_url.endsWith(".mp4");
	if (is_mp4) {
		container.innerHTML = 
			`<a href="${href}" title="${hover_description}"> \
				<video width="${width}" height="${height}" autoplay loop muted> \
					<source src="${img_url}" type="video/mp4"> \
				</video>
			</a>`;
	}
	else {
		container.innerHTML = 
			`<a href="${href}" title="${hover_description}">` +
				`<img src="${img_url}" width="${width}" height="${height}">`+
			`</a>`;
	}
	container.style["width"] = `${width}px`;
	container.style["height"] = `${height}px`;
	container.classList.add("banner");
}




function load_banners() {

	return bna.then(bna => {

		const db = window.localStorage;

		for (let i = 0; i < bna.banners.supported_sizes.length; i++) {
			const size = bna.banners.supported_sizes[i];

			const width  = parseInt(size.substring(1, size.indexOf("x")));
			const height = parseInt(size.substring(size.indexOf("x")+1));

			const banners = bna.banners[size];
			const banner_containers = document.getElementsByClassName("banners"+size);

			let banner_index = db.getItem('banner_index'+size);
			if (banner_index == null) {
				// we don't want the choosen banner on a first visit to be the same for 
				// everyone cause then it will get biased towards one project.
				banner_index = Math.floor(Math.random()*banners.length);
			}
			
			for (let i = 0; i < banner_containers.length; i++) {

				let container = banner_containers[i];

				// it is possible to create a banner for a specific site
				// e.g. <div class="banners_128x64" data-site="prolactin"></div>
				if (container.dataset.site != undefined) {

					let site = container.dataset.site;
					let href = bna.hsl_root+"/"+site;
					let hover_description = bna.info_all_sites[site].hover_description;
					let sized_banners = bna.sites[site].banners[size];
					let img_url = sized_banners[Math.floor(Math.random()*sized_banners.length)];

					create_banner_for_container(container, href, hover_description, img_url, width, height);
				}
				else {

					let banner_data = banners[ banner_index % banners.length ];

					// avoid banners that point to the site we are already on
					if (`${banner_data.site}` == bna.current_site.site_folder) {
						banner_index++;
						i--;
						continue;
					}

					let href = bna.hsl_root+"/"+banner_data.site;
					let all_img_urls = banner_data.banners;
					let random_img_url = all_img_urls[Math.floor(Math.random()*all_img_urls.length)];

					create_banner_for_container(container, href, bna.info_all_sites[banner_data.site].hover_description, random_img_url, width, height);
					
					banner_index++;
				}
			}

			db.setItem('banner_index'+size, banner_index);
		}


	});	
}




const create_css_styles = function() {
	var sheet = document.createElement('style')
	sheet.innerHTML = 
		`.banner {
			border: 1px solid black;
		}`;
	document.body.appendChild(sheet);
}


const set_html_title = function() {
	bna.then(bna => {
		if (document.title == "") {
			document.title = bna.current_site.title;	
		}
	});
}


const create_bna = async function() {

	let bna = {
		"banners": {
			// @Banner_Support_Sizes
			"supported_sizes": ["_512x128", "_128x512", "_128x64"]
		},
		"sites": {
		},
		"current_site": {
			"site_folder": (function() {
				let path = document.location.pathname;
				path = path.substring(0, path.length-1);
				return path.substring(path.lastIndexOf("/")+1);
			})()
		}
	};


	// the site can be online on hslab.nl
	// or on localhost, which could point directly to the hslab.nl folder
	// or to a folder that contains a hslab.nl folder
	// or it can be named hslab.nl-master.
	// We have this complexity here so:
	// A) it's more easy for students to do the setup
	// B) we can change domain later and only have to deal with the pain here
	// C) it deals with the different ways people are using localhost
	bna.hsl_root = (function() {
		if (document.location.href.includes('hslab.nl-master')) {
			return document.location.href.substring(0, document.location.href.indexOf('hslab.nl-master')+15);	
		}
		else if (document.location.href.includes('hslab.nl')) {
			return document.location.href.substring(0, document.location.href.indexOf('hslab.nl')+8);	
		}
		else {
			return document.location.origin;
		}
	})();


	let files = [];
	const resources = [
		bna.hsl_root+"/_misc/info_all_sites.json", 
		bna.hsl_root+"/_misc/banners.json"
	];
	resources.forEach(it => {
		files.push(fetch(it))
	});

	
	files = await Promise.all(files);

	let json_promises = [];
	files.forEach(it => {
		json_promises.push(it.json());
	});

	return Promise.all(json_promises).then(jsons => {
		bna.info_all_sites = jsons[0];
		bna.banners = Object.assign(jsons[1], bna.banners);

		//
		// fill in bna.sites
		//
		for (let i = 0; i < bna.banners.supported_sizes.length; i++) {
			const size = bna.banners.supported_sizes[i];

			for (let j = 0; j < bna.banners[size].length; j++) {

				let sized_banners = bna.banners[size][j];

				for (let k = 0; k < sized_banners.banners.length; k++) {
					sized_banners.banners[k] = bna.hsl_root+"/"+sized_banners.banners[k];
				}

				if (bna.sites[sized_banners.site] == undefined) {
					bna.sites[sized_banners.site] = {"banners": {}};
				}
				bna.sites[sized_banners.site].banners[size] = sized_banners.banners;	
			}
		}

		bna.current_site = Object.assign(bna.info_all_sites[bna.current_site.site_folder], bna.current_site);
		bna.current_site = Object.assign(bna.sites[bna.current_site.site_folder], bna.current_site);

		dbna = bna;

		return bna;
	});

};


let bna = create_bna();
let dbna; // for debug purposes in the console only, since bna is a Promise and they are hard to work with in the console (imposible?)

(function(){
	
	window.addEventListener("DOMContentLoaded", function() {
		create_css_styles();
		load_banners();
		set_html_title();
	});

})();

"use strict";
// fuck javascript

let _dbna; // for debugging purposes only!

const p_bna = (async function() {

	const hsl_root = (function() {
		// Some people point their localhost to a folder where multiple sites live.
		// This can give issues with loading files. We deal with that here.
		if (document.location.href.includes('localhost') || document.location.href.includes('127.0.0.1')) {
			let index_of_hslab_dot_nl = document.location.href.indexOf('hslab.nl');
			let slash_index = document.location.href.indexOf("/", index_of_hslab_dot_nl);
			return document.location.href.substring(0, slash_index);
		}
		else {
			return document.location.origin;
		}
	})();


	//
	// data.json
	//
	const data = {
		...{"hsl_root": hsl_root}, 
		... await (await fetch(hsl_root+"/_misc/data.json")).json()
	}

	//
	// complete the banner sources so it's a full link
	// and set href for site
	//
	for (const site in data.sites) {
		data.supported_banner_sizes.forEach(size => {
			const arr = data.sites[site].banner_sources[size];
			for (const i in arr) {
				arr[i] = `${hsl_root}/${site}/${arr[i]}`;
			}
		});
		data.sites[site].href = `${hsl_root}/${site}`;
	}

	//
	// set data.current_site
	//
	data.current_site = (() => {
		let path = document.location.pathname;
		path = path.substring(0, path.length-1);
		path = path.substring(path.lastIndexOf("/")+1);
		return data.sites[path];
	})();

	//
	// data.sites_that_have_banner_size_x
	//
	data.sites_that_have_banner_size_x = {};
	data.supported_banner_sizes.forEach(size => {
		data.sites_that_have_banner_size_x[size] = [];
		for (const site in data.sites) {
			if (data.sites[site].banner_sources[size]) {
				data.sites_that_have_banner_size_x[size].push(data.sites[site]);
			}
		}
	});
	

	//
	// functions
	//

	const create_css_styles = function() {
		var sheet = document.createElement('style')
		sheet.innerHTML = 
			`.banner {
				border: 1px solid black;
			}`;
		document.body.appendChild(sheet);
	}


	const set_html_title = function() {
		if (document.title == "") {
			document.title = data.current_site.title;	
		}
	}


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

		const db = window.localStorage;

		for (let i = 0; i < data.supported_banner_sizes.length; i++) {
			const size = data.supported_banner_sizes[i];

			const width  = data.width_height_lookup[size][0];
			const height = data.width_height_lookup[size][1];

			const banner_containers = document.getElementsByClassName("banners"+size);

			for (let i = 0; i < banner_containers.length; i++) {
				let container = banner_containers[i];

				// it is possible to create a banner for a specific site
				// e.g. <div class="banners_128x64" data-site="prolactin"></div>
				if (container.dataset.site != undefined) {

					const _site = container.dataset.site;
					const site = data.sites[_site];
					const all_img_urls = site.banner_sources[size];
					const random_img_url = all_img_urls[Math.floor(Math.random()*all_img_urls.length)];

					create_banner_for_container(container, 
						site.href, site.hover_description, 
						random_img_url, width, height);
				}
				else {
					// next banner that fits
					const sites = data.sites_that_have_banner_size_x[size];
					
					let index = db.getItem('index_for_size'+size);
					if (index == null) {
						// we don't want the choosen banner on a first visit to be the same for 
						// everyone cause then it will get biased towards one project.
						index = Math.floor(Math.random()*sites.length);
					}

					// avoid banners that point to the site we are already on
					if (data.current_site.folder == sites[index].folder) {
						index++;
						index %= sites.length;
					}

					const site = sites[index];
					
					const all_img_urls = site.banner_sources[size];
					const random_img_url = all_img_urls[Math.floor(Math.random()*all_img_urls.length)];

					create_banner_for_container(container, 
						site.href, site.hover_description, 
						random_img_url, width, height);
					

					index++;
					index %= sites.length;
					db.setItem('index_for_size'+size, index);
				}

			}
		}
	}


	//
	// library
	//

	const result = {
		...data, 
		"create_css_styles": create_css_styles,
		"set_html_title": set_html_title,
		"load_banners": load_banners,
	}

	_dbna = result;

	return result;

})();


(function(){
	
	window.addEventListener("DOMContentLoaded", async function() {

		const bna = await p_bna;

		bna.create_css_styles();
		bna.set_html_title();
		bna.load_banners();
		
	});

})();


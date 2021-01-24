"use strict";
// fuck javascript

let _dbna; // for debugging purposes only!

const p_bna = (async function() {


	const _project_root = (function() {
		let href = document.location.href;
		return href.substring(0, href.indexOf("/_sites/"));
	})();

	
	//
	// data.json
	//
	const data = {
		...{"project_root": _project_root}, 
		... await (await fetch(_project_root+"/_misc/data.json")).json()
	}

	//
	// complete the banner sources so it's a full link
	// and set href for site
	//
	for (const site in data.sites) {
		data.supported_banner_sizes.forEach(size => {
			const arr = data.sites[site].banner_sources[size];
			for (const i in arr) {
				arr[i] = `${_project_root}/_sites/${site}/${arr[i]}`;
			}
		});
		data.sites[site].href = `${_project_root}/_sites/${site}`;
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
		const sheet = document.createElement('style');

		let css = 
			`.banner {
				border: 1px solid black;
			}

			.banner img {
				width: 100%;
				height: 100%;
			}

			.banner video {
				width: 100%;
				height: 100%;
			}
			`
		;

		data.supported_banner_sizes.forEach((size) => {
			const width  = data.width_height_lookup[size][0];
			const height = data.width_height_lookup[size][1];

			css += '\n'+
			`.banner_${width}x${height} {
				width: ${width};
				height: ${height};
			}`

		});

		sheet.innerHTML = css;;
		document.head.insertBefore(sheet, document.head.firstChild);
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
					<video autoplay loop muted> \
						<source src="${img_url}" type="video/mp4"> \
					</video>
				</a>`;
		}
		else {
			container.innerHTML = 
				`<a href="${href}" title="${hover_description}">` +
					`<img src="${img_url}">`+
				`</a>`;
		}
		container.classList.add("banner");
	}



	function load_banners() {

		for (let i = 0; i < data.supported_banner_sizes.length; i++) {
			const size = data.supported_banner_sizes[i];

			const width  = data.width_height_lookup[size][0];
			const height = data.width_height_lookup[size][1];

			const banner_containers = document.getElementsByClassName("banner"+size);

			for (let i = 0; i < banner_containers.length; i++) {
				let container = banner_containers[i];

				let site;

				// it is possible to create a banner for a specific site
				// e.g. <div class="banner_128x64" data-site="prolactin"></div>
				if (container.dataset.site != undefined) {

					const req_site = container.dataset.site;
					if (data.sites[req_site]) {
						site = data.sites[req_site];	
					}
					else {
						console.error(`banner suggestion for site '${req_site}', but it does not exist!`);
						site = data.sites_that_have_banner_size_x[size][0];
					}
				}
				else {
					// next banner that fits
					const sites = data.sites_that_have_banner_size_x[size];
					
					const db = window.localStorage;
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

					site = sites[index];
					
					index++;
					index %= sites.length;
					db.setItem('index_for_size'+size, index);
				}

				const all_img_urls = site.banner_sources[size];
				const img_url = all_img_urls[Math.floor(Math.random()*all_img_urls.length)];

				create_banner_for_container(container, 
					site.href, site.hover_description, 
					img_url, width, height);

			}
		}
	}


	const request_fullscreen = function() {

		const elm = document.documentElement;

		const method = elm.requestFullScreen || 
							elm.webkitRequestFullScreen || 
							elm.mozRequestFullScreen || 
							elm.msRequestFullScreen;

		return method.call(elm);
	}

	const exit_fullscreen = function() {

		if (document.exitFullscreen) {
			return document.exitFullscreen();
		}
		else if (document.mozCancelFullScreen) {
		    return document.mozCancelFullScreen();
		}
		else if (document.webkitCancelFullScreen) {
		    return document.webkitCancelFullScreen();
		}
		else if (document.msExitFullscreen) {
		    return document.msExitFullscreen();
		}
	}

	const is_fullscreen = function() {
		if (document.fullscreen != undefined) return document.fullscreen;
		if (document.mozFullScreen != undefined) return document.mozFullScreen;
		if (document.webkitIsFullScreen != undefined) return document.webkitIsFullScreen;
		if (document.msFullscreenElement != undefined) return document.msFullscreenElement;
	}

	const toggle_fullscreen = function() {
		if (is_fullscreen()) {
			return exit_fullscreen();
		}
		else {
			return request_fullscreen();
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
		"request_fullscreen": request_fullscreen,
		"exit_fullscreen": exit_fullscreen,
		"is_fullscreen": is_fullscreen,
		"toggle_fullscreen": toggle_fullscreen
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


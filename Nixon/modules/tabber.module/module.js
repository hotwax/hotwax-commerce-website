let tabberMainWrap =  document.querySelectorAll('.tabber-grp');
for(var i = 0; i<tabberMainWrap.length; i++){
	let tabberNav = tabberMainWrap[i].querySelectorAll('.tabber-grp .tabber-title');
	let tabberPanal = tabberMainWrap[i].querySelectorAll('.tabber-grp .tabber-desc');
	for(var j = 0; j<tabberNav.length; j++){
		tabberNav[j].addEventListener('click',tabberInit);
	}
	function tabberInit(e){
		e.preventDefault();
		for(var d = 0; d<tabberNav.length; d++){
			tabberNav[d].classList.remove('tab-active');
		}
		this.classList.add('tab-active');
		for(var d = 0; d<tabberNav.length; d++){
			tabberPanal[d].classList.remove('show-tab');
		}
		const tabId = this.getAttribute('data-tab');
		let tabidMai = document.querySelector('#'+tabId);
		tabidMai.classList.add('show-tab');
	}
}
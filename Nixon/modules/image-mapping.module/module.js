let mappingImg = document.querySelectorAll('.imgmapping-wrap');
let mappingItem = document.querySelectorAll('.imgmapping-item');
let mappingItemcnt = document.querySelectorAll('.imgmapping-item-mobile-cnt');
let mappingBody = document.querySelector("body");
for(var i = 0; i < mappingImg.length; i++){
	let mappingItemIcon = mappingImg[i].querySelectorAll('.imgmapping-item-icon');
	let mappingItemInner = mappingImg[i].querySelectorAll('.imgmapping-item-cnt');
	let mappingItemmobileInner = mappingImg[i].querySelectorAll('.imgmapping-item-mobile-cnt');
	for(var j = 0; j < mappingItemIcon.length; j++){
		mappingItemIcon[j].addEventListener('click',mappingInit);
	}	
	for(var k = 0; k < mappingItemInner.length; k++){
		mappingItemInner[k].addEventListener('click',function(e){
			e.stopPropagation();
		});
	}
	function mappingInit(e){
		e.preventDefault();
		for(var d = 0; d<mappingItemIcon.length; d++){
			mappingItemIcon[d].parentElement.classList.remove('active');
		}
		this.parentElement.classList.add('active');  
		
		for(var w = 0; w < mappingItemIcon.length; w++){
			mappingItemmobileInner[w].classList.remove('show-tab');
		}
		
		const tabId = this.getAttribute('data-tab');
		let tabidMai = document.querySelector('#'+tabId);
		tabidMai.classList.add('show-tab');
		e.stopPropagation(); 
	}
}

mappingBody.addEventListener("click", mappingClose);
function mappingClose(){
	for(var d = 0; d < mappingItem.length; d++){
		mappingItem[d].classList.remove("active");
	}
	for(var p = 0; p < mappingItemcnt.length; p++){
		mappingItemcnt[p].classList.remove("show-tab");
	}
}


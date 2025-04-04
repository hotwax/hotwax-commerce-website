let popup = document.querySelectorAll(".footer .popup-wrap");
popup.forEach((e)=>{
	if(e.firstElementChild.classList.contains("popup")){
		e.firstElementChild.addEventListener('click',()=>{
			e.classList.add('popup-open');
			document.body.classList.add("pop");
			if(e.lastElementChild.classList.contains("popup-type-video")){
				let frame = e.querySelector('iframe');
				frame.setAttribute('src',frame.dataset.url);
			}
		})
	}

	if(e.lastElementChild.lastElementChild.classList.contains("popup-overlay")){
		e.lastElementChild.lastElementChild.addEventListener('click',()=>{
			e.classList.remove('popup-open');
			document.body.classList.remove("pop");
			if(e.lastElementChild.classList.contains("popup-type-video")){
				let frame = e.querySelector('iframe');
				frame.setAttribute('src',"");
			}
		})
	}
	let closepop = e.querySelector(".popup-close");
	closepop.addEventListener("click",()=>{
		e.classList.remove('popup-open');
		document.body.classList.remove("pop");
		if(e.lastElementChild.classList.contains("popup-type-video")){
			let frame = e.querySelector('iframe');
			frame.setAttribute('src',"");
		}
	})
})


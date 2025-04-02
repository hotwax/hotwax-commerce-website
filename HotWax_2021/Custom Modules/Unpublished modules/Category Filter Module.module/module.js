$(document).ready(function() {
    $(".blog-load-more").hide();
    var matched = $(".desktop-blog-post .post-item");
    var div_length = matched.length;
    if(div_length >= 9) {
        $(".blog-load-more").show('slow');
    } else  {
        $(".blog-load-more").hide('slow');
    }
    $(".desktop-blog-post .post-item").hide();
    $(".desktop-blog-post .post-item").slice(0, 9).show();
    $('ul.post-filter-outer li:first-child').addClass('active-tag');
    $('ul.post-filter-outer li').click(function() {
        $(this).addClass('active-tag');
        $(this).siblings().removeClass('active-tag');
        $('.desktop-blog-post .post-item').hide();
        var data_var = $(this).attr('data-attr').toLowerCase();
     	console.log(data_var);
        $('.desktop-blog-post .post-item').each(function() {
          var div_cls = $(this).attr('class').toLowerCase();
     	console.log(div_cls);
          if($(this).hasClass(data_var)) {
            $(this).show();
            $(".blog-load-more").hide('slow');
          } 
          if(data_var == "all") {
            $(".desktop-blog-post .post-item").slice(0, 9).show();
            $(".blog-load-more").show('slow');
            if ($(".desktop-blog-post .post-item:hidden").length == 0) {
               $(".blog-load-more").hide('slow');
            }
          }
        });
    });
   $('p#hubspot-topic_data span').click(function() {
        $('.desktop-blog-post .post-item').hide();
        var data_var = $(this).attr('data-attr').toLowerCase();
     	console.log(data_var);
        $('.desktop-blog-post .post-item').each(function() {
          var div_cls = $(this).attr('class').toLowerCase();
          if($(this).hasClass(data_var)) {
            $(this).show();
            $(".blog-load-more").hide('slow');
          } 
          if(data_var == "all") {
            $(".desktop-blog-post .post-item").slice(0, 9).show();
            $(".blog-load-more").show('slow');
            if ($(".desktop-blog-post .post-item:hidden").length == 0) {
               $(".blog-load-more").hide('slow');
            }
          }
        });
    });
    $("a.viewmore").on('click', function (e) {
       e.preventDefault();
       $(".desktop-blog-post .post-item:hidden").slice(0, 3).show();
       if ($(".desktop-blog-post .post-item:hidden").length == 0) {
          $(".blog-load-more .viewmore").text("No more content").addClass("noContent");
       }
    });
});


$(document).ready(function() {
    /*$(".desktop-blog-post .post-item").hide();
    $(".desktop-blog-post .post-item").slice(0, 9).show();
    $('ul.post-filter-outer li:first-child').addClass('active-tag');
    $('ul.post-filter-outer li').click(function() {
        $(this).addClass('active-tag');
        $(this).siblings().removeClass('active-tag');
        $('.desktop-blog-post .post-item').hide();
        var data_var = $(this).attr('data-color').toLowerCase();
     	console.log(data_var);
        $('.desktop-blog-post .post-item').each(function() {
          var div_cls = $(this).attr('class');
          if($(this).hasClass(data_var)) {
            $(this).show();
            $(".blog-load-more").hide('slow');
          } 
          if(data_var == "all") {
            $(".desktop-blog-post .post-item").slice(0, 9).show();
            $(".blog-load-more").show('slow');
            if ($(".desktop-blog-post .post-item:hidden").length == 0) {
               $(".blog-load-more").hide('slow');
            }
          }
        });
    });
   $("a.viewmore").on('click', function (e) {
       e.preventDefault();
       $(".desktop-blog-post .post-item:hidden").slice(0, 3).fadeIn("slow");
       if ($(".desktop-blog-post .post-item:hidden").length == 0) {
          $(".blog-load-more").fadeOut("100");
       }
    });
  */
   
  
  
  
  
$('<li id="more">More <i class="fas fa-chevron-down"></i><div class="more-item"></li>').insertAfter('ul.post-filter-outer li:nth-child(5)');

  $( "li .more-item" ).append( $( "ul.post-filter-outer li:nth-child(n+7)" ) );

  
  
  
 // get input field and add 'keyup' event listener
let searchInput = document.querySelector('.search-input');
searchInput.addEventListener('keyup', search);

// get all title
let titles = document.querySelectorAll('.main .title');
let searchTerm = '';
let tit = '';

function search(e) {
  // get input fieled value and change it to lower case
  searchTerm = e.target.value.toLowerCase();

  titles.forEach((title) => {
    // navigate to p in the title, get its value and change it to lower case
    tit = title.textContent.toLowerCase();
    // it search term not in the title's title hide the title. otherwise, show it.
    tit.includes(searchTerm) ? title.style.display = 'block' : title.style.display = 'none';
  });
} 
});






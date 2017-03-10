var ST = {

  loader: new Loader(),

  slider: new Slider(  $('.slider').get(0), { autoplay: true , delay: 8000} ),

  helpers: {
    formatMoney: function(pennies){
      return (pennies/100).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    },
    plural: function(num){
      return num > 1? 's' : '';
    },
    isTouchDevice: function() {
      return 'ontouchstart' in window        // works on most browsers
          || navigator.maxTouchPoints;       // works on IE10/11 and Surface
    },
    shuffle: function(a) {
      var j, x, i;
      for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
      }
    }
  },

  fortuneCookie: {
    list: [
      "This month's non-contractually-binding lucky numbers: 7, 2, 5, 4, 9, 1, 8, 0, 6, and 3.",
      "Fortune not found. Restart computer.",
      "This is a good place for a bad fortune.",
      "A fortune with no cookie is a travesty and we refuse to be complicit.",
      "Do not touch the fortune as the fortune may become aroused.",
      "If fortune persist for more than 6 hours, please consult a doctor.",
      "You will meet a tall, mysterious stranger. Related: You will die.",
      "Please do not feed the fortune-tellers.",
      "This fortune sadly won’t shield you from the horrors of your everyday predictable life.",
      "Fair warning: This crystal ball is just a Magic 8-Ball.",
      "You were born a ginger, but your parent had a surgery performed.",
      "If plastic seal has been broken, please disregard fortune.",
      "Your lucky number 371802 was pulled! Please consult our 404 page for prize.",
      "Pokemon Go servers experiencing issues. Please try again later.",
      "You will inherit millions. Of new bacteria.",
      "You are likely to be eaten by a grue.",
      "Uh, we had a slight weapons malfunction, but uh... everything's perfectly all right now. We're fine. We're all fine here now, thank you.",
      "We honor our competitors' fortune coupons, too.",
      "All your base are belong to us.",
      "(╯°□°）╯︵ ┻━┻",
      "┻━┻ ︵ヽ(`Д´)ﾉ︵﻿ ┻━┻",
      "ʕノ•ᴥ•ʔノ ︵ ┻━┻",
      "We honor our competitors' fortune coupons, too.",
      "It’s not the size of the fortune, but how you use it.",
      "Please do not compare fortunes, there’s a high probability they’re all the same.",
      "You will eat. You will poop. You will drink. You will pee.",
      "You will never get through all of the fortunes, the database is literally infinite. Why lie about it?",
      "You are only human–which is disappointing, to say the least.",
      "You will meet a tall, attractive stranger, but they'll just be asking for back taxes. ",
      "If you tweet this, you will gain one million followers* *must boost tweet for one million days.",
      "Comic books are for children, just like joy.",
      "The key to happiness is [404 error].",
      "You're on the Super Team now, but the Deluxe must be earned.",
      "Please submit a 1000-word essay on why Desiigner's \"Panda\" is totally OK.",
      "You will name one of your children \"Fetty Wap\" long after anyone remembers the reference.",
      "Mr. Robot has been dead the whole time.",
      "You will encounter someone with a hat, but they will ignore you.",
      "You will find a phone number in a book today. Try calling it, I guess? I dunno. It's your life.",
      "Ipsem lorem Newt Gingrich is a tool lorem ipsum.",
      "You'll&hellip;walk somewhere? And see a person. Maybe you'll talk? Who can know.",
      "Sometimes it's best to not know the future. Especially yours. Yeesh.",
      "Congrats on becoming a parent!",
      "Why not be surprised by all of the amazing stuff that's just around the corner?"

    ],
    tell: function(e){
      $('#fortune-cookie').html(
        ST.fortuneCookie.list[Math.floor(Math.random()*(ST.fortuneCookie.list.length-1))]
        + ' <a class="another-one" title="Another One.">🔑</a>'
      );
    }
  },

  checkout: {
    show: function(data){
      ST.loading();
      var update = function( data ){
        ST.loaded();
        ST.updateDOM($('#cart--details'),data);
        if(data.item_count > 0){
          $('.cart').addClass('open');
        } else {
            ST.checkout.hide();
        }
      }
      if(data){
        update(data);
      } else {
        $.getJSON('/cart.js',update);
      }
    },
    hide: function(){
      $('.cart').removeClass('open');
    }
  },

  loading: function(){
    ST.loader.show();
  },

  loaded: function(){
    ST.loader.hide();
  },

  ajaxForm: function( forms ){

    forms.on('submit',function(e){
      e.preventDefault();
      var $form = $(this).addClass('disabled');
      ST.loading();
      ST.checkout.hide();
      $[$form.attr('method') || 'post'](
        $form.attr('action'),
        $form.serialize(),
        function(response){
          ST.loaded();
          var a = document.createElement('a');
          a.href = $form.attr('action');
          var showIt = function(){
            ST.checkout.hide();
            var r = new Reticle(
                null,
                {
                    init: ST.init,
                    destroyDelay: 500,
                    loading: function(){
                      ST.loading();
                      ST.checkout.hide();
                    },
                    loaded: function(){
                      ST.loaded();
                      ST.checkout.hide()
                    },
                    hide: ST.checkout.show
                }
            );
            r.loading();
            r.loadText(response,a.hash);
            r.loaded();
            r.show();
          }
          if( Reticle.instance ){
            Reticle.instance.hide( showIt );
          } else {
            showIt();
          }

      });
    });

  },

  updateDOM: function(dom,data){
    if(!$(dom).data('template')) return;
    $(dom).html(rndr($($(dom).data('template')).html(),data));
  },

  init: function(fragment){

    if(fragment){

      new SVGButton($(fragment).get(0).querySelectorAll('.btn'),'0 0 28 10','M 0.108245 3.33245C 0.312457 1.80982 1.64228 0.811825 3.16355 0.597672C 7.40919 0 11.427 0 14 0L 14 3.50802e-50C 16.573 9.0267e-34 20.5908 -1.11022e-16 24.8365 0.597672C 26.3577 0.811825 27.6875 1.80983 27.8918 3.33246C 28.0361 4.40858 28.0361 5.59142 27.8918 6.66753C 27.6875 8.19017 26.3577 9.18817 24.8364 9.40233C 20.5908 10 16.573 10 14 10L 14 10C 11.427 10 7.40919 10 3.16354 9.40233C 1.64228 9.18817 0.312457 8.19018 0.108245 6.66755C -0.0360816 5.59143 -0.0360816 4.40857 0.108245 3.33245Z');

      // preload images
      var images = $(fragment).get(0).getElementsByTagName('img');
      for(var i=0; i < images.length; ++i ){
        if(images[i].complete){
          images[i].classList.add('loaded');
        } else {
          images[i].addEventListener('load',function(){
            this.classList.add('loaded');
          });
        }
      }

      // setup ajaxy cart
      $(fragment).find('form[action^="/cart/add"]').on('submit',function(e){
        e.preventDefault();
        ST.loading();
        $.post(
          '/cart/add.js',
          $(this).serialize(),
          function(){
            ST.loaded();
            ST.checkout.show();
        });
      });

      ST.ajaxForm($(fragment).find('form[action^="/contact"]'));

      $(fragment).find('form[action="/cart"]').on('change',function(e){
        e.preventDefault();
        ST.checkout.hide();
        var submitBtn = $(this).find(':submit').attr('disabled','disabled');
        ST.loading();
        $.getJSON(
          '/cart/update.js',
          $(this).serialize(),
          function(data){
            submitBtn.removeAttr('disabled');
            ST.updateDOM($('#cart-subtotal'),data);
            ST.loaded();
        });
      });


    } else {

      ST.loading();
      window.removeEventListener('load', ST.loaded);
      window.addEventListener('load', ST.loaded);



      // nav shit
      var nav = $('.nav'),
          navBg = $('.nav--bg'),
          navLogo = $('.nav--logo'),
          header = $('header.featured-products');

      if( header.length && !ST.helpers.isTouchDevice()){

        $(window).scroll(function(i){
          var s = $(window).scrollTop(),
              h = Math.max(header.height(),250),
              percent = s > ((h-100)*.75)? (s-((h-100)*.75))/((h-100)*.25): 0,
              percent = percent > 1? 1 : percent;

              navBg.css({top: -100*(1-percent) - 5});
              navLogo.css({top: 5*percent,width:100-(40*percent),height:100-(40*percent)});

              if(percent >= 1){
                  nav.addClass('fixed');
              } else {
                  nav.removeClass('fixed');
              }
        }).trigger('scroll');

      } else {
        nav.addClass('fixed');
        navBg.css({top: -5});
        navLogo.css({top: 5,width:60,height:60});
      }

      if( ST.helpers.isTouchDevice() ){
        $('html').addClass('touch');
      } else {
        $('html').addClass('click');
      }


      // embed tweets
      if( window.twttr && twttr.widgets ){
        var tweets = $('[tweet-id]');
        ST.helpers.shuffle(tweets);
        tweets.each(function(){
          twttr.widgets.createTweet(
            $(this).attr('tweet-id'),
            $(this).get(0),
            {
              linkColor: "#9A94E8",
              width: 300,
              cards: 'hidden',
              theme: 'light'
            }
          );
        });
        tweets.parent().html(tweets);
      }

      // initialize reticle links
      $(document).on('click','.reticle-link',function(e){
          e.preventDefault();
          Reticle(
            this.getAttribute('href'),
            {
              init: ST.init,
              destroyDelay: 500,
              loading: function(){
                ST.loading();
                ST.checkout.hide();
              },
              loaded: function(){
                ST.loaded();
                ST.checkout.hide();
              },
              hide: ST.checkout.show
            }
          );
      });

      $(document).on('click','.another-one',ST.fortuneCookie.tell);

      // setup galleries
      $(document).on('click','.gallery--image',function(){
        $(this).parent().find('.gallery--image').removeClass('active');
        $(this).addClass('active');
      });

    }

  }
};

ST.init();
ST.init('html');
ST.checkout.show();
function Reticle( resource, opts ){

  if( !(this instanceof Reticle) ){
    new Reticle( resource, opts ).show();
    return;
  }

  var html = document.documentElement,
      body = document.body,
      self = this,
      options = {
          loading: function(){},
          loaded: function(){},
          hide: function(){},
          init: function(){},
          modal: false
      },
      cssPrefix   = 'reticle';
      config   = {
        keyBindings: {
          hide: [27]
        }
      };

  make('content');
  make('backdrop');
  if(!options.modal){
    make('close-btn');
  }

  function make(name){
    self[name] = document.createElement('div');
    self[name].className = cssPrefix + (name!='content'? '-' + name : '');
    html.appendChild(self[name]);
  }

  function ext(o1,o2){
    if( typeof o2 != 'object' ) return;
  	for(var key in o2){
  		if(key in o1 &&  o1[key] && o1[key].constructor == Object){
  				ext(o1[key],o2[key]);
  		}else{
  		  o1[key] = o2[key];
  		}
  	}
  	return o1;
  }

  //extend options
  if( typeof opts == 'string' ){
    opts = { caption: opts };
  }
  ext(options,opts);

  var prefix = (function () {
    var styles = window.getComputedStyle(document.documentElement, ''),
      pre = (Array.prototype.slice
        .call(styles)
        .join('')
        .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
      )[1],
      dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
    return {
      dom: dom,
      lowercase: pre,
      css: '-' + pre + '-',
      js: pre[0].toUpperCase() + pre.substr(1)
    };
  })();

  function keyUpListener(e) {
    for(var cmd in config.keyBindings ){
      if (config.keyBindings[cmd].indexOf(e.keyCode) > -1) {
        if( typeof self[cmd] == 'function' ){
          self[cmd]();
        }
      }
    }
  }

  function clickListener( e ){
    if( e.target == self.content ){
      self.hide();
    }
  }

  function ajax(url, callback, data, x) {
  	try {
  		x = new(this.XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
  		x.open(data ? 'POST' : 'GET', url, 1);
  		x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  		x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  		x.onreadystatechange = function () {
  			x.readyState > 3 && callback && callback(x.responseText, x);
  		};
  		x.send(data)
  	} catch (e) {
  		window.console && console.log(e);
  	}
  }

  function watchHistoryPop(){
    if( typeof resource == 'string' ){
      self.hide();
    }
  }

  function fragUrl( str ){
    var chunks = str.split('#'),
        frags = {
          url: chunks[0]
        };
        if(chunks.length > 1){
          frags.selector = chunks[1];
        }
    return frags;
  }

  this.destroy = function(){
    html.removeChild(this.content);
    html.removeChild(this.backdrop);
    if(!options.modal){
      html.removeChild(this['close-btn']);
    }
    options.hide.call(this);
    html.classList.remove(cssPrefix + '-loading');
    html.classList.remove(cssPrefix + '-loaded');
    delete Reticle.instance;
  }

  this.show = function(){
    function showIt(){
      if( typeof resource == 'string' ){
        // image
        if( /\.(jpeg|jpg|gif|png)(\?|#)?(.*)?$/ig.test(resource) ){

          self.loadImage( resource, options.caption );
          self.loaded();

        } else if( /^#/.test(resource) ){

          self.loadTarget( resource );
          self.loaded();

        } else {

          var frags = fragUrl( resource );
          setTimeout(function(){
            ajax( frags.url, function(txt){
                self.loadText(txt,frags.selector || '.reticle-page');
                self.loaded();
            });
          },1);
        }
      } else if(resource) {
        self.loadNode( resource );
        self.loaded();
      }

      if(!options.modal){
        if( typeof resource == 'string' ){
          history.pushState(resource,null,resource);
          window.removeEventListener('popstate', watchHistoryPop);
          window.addEventListener('popstate', watchHistoryPop);
        }
        self['backdrop'].addEventListener('click',self.hide);
        self['close-btn'].addEventListener('click',self.hide);
        html.addEventListener('keyup',keyUpListener);
      }

      setTimeout(function(){
        html.classList.add(cssPrefix + '-open');
        Reticle.instance = self;
      },10);
    }

    if(Reticle.instance){
      Reticle.instance.hide( showIt );
    } else {
      showIt();
    }
  }

  this.hide = function( hideCallback ){
    if( typeof resource == 'string' ){
      history.replaceState({},null,'/');
      window.removeEventListener('popstate', watchHistoryPop );
    }
    html.removeEventListener('keyup',keyUpListener);
    self['backdrop'].removeEventListener('click',self.hide);
    self['close-btn'].removeEventListener('click',self.hide);
    if( !options.destroyDelay ){
      html.classList.remove( cssPrefix + '-open' );
      self.destroy();
    } else {
      html.classList.remove( cssPrefix + '-open' );
      setTimeout( function(){self.destroy();}, options.destroyDelay );
      if( typeof hideCallback == 'function'){
        setTimeout( hideCallback, options.destroyDelay );
      }
    }
  }

  this.loading = function(){
    options.loading.call(this);
    html.classList.add( cssPrefix + '-loading' );
  }

  this.loaded = function(){
    options.loaded.call(this);
    html.classList.remove( cssPrefix + '-loading' );
    html.classList.add( cssPrefix + '-loaded' );
  }

  //load image
  this.loadImage = function( url, caption ){
    this.loading();
    var imgLoaded = function(){
      mediaContainer.appendChild( img );
      if( typeof caption == 'string' ){
        var cap = document.createElement('span');
        cap.className = cssPrefix + '-caption';
        cap.innerHTML = caption;
        mediaContainer.appendChild( cap );
      }
      backdrop.style.backgroundImage = 'url("' + url + '")';
      self.loaded();
    }

    var mediaContainer = document.createElement('div');
    this.content.appendChild( mediaContainer );

    var img = document.createElement('img');
    img.addEventListener('load', imgLoaded);
    img.src = url;
    if(img.complete){
      imgLoaded();
    }
  }

  this.loadTarget = function( hash ){
    var node = document.getElementById( hash.replace(/^#/,'') );
    this.loadNode( node );
  }

  this.loadNode = function( node ){
    if( typeof node == 'object' && node.tagName != undefined ){
      if( node.tagName.toLowerCase() == 'img' ){
        this.loadImage( node.src, node.getAttribute('alt') );
      } else {
        var node = node.cloneNode(true);
        node.style.display = 'inline-block';
        options.init(node);
        this.content.appendChild(node);
      }
    }
  }

  this.loadText = function( txt,selector ){
    var node = document.createElement('div');
    node.innerHTML = txt;
    if( selector ){
      var selection  = node.querySelector( selector );
      if( selection != null ){
        node = selection;
      }
    }
    node.style.display = 'inline-block';
    options.init(node);
    this.content.innerHTML = '';
    this.content.appendChild( node );
  }

}
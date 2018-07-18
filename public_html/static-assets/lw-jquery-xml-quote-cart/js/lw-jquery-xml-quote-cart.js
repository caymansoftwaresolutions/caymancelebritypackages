/*! 
	jQuery XML Product Showcase & Quote Cart
	by LivelyWorks - http://livelyworks.net
	Ver. 1.0.1
*/	

$(document).ready(function(){
"use strict"

	_.templateSettings.variable = "_oData";

	/*
		Configuration Options
	*/

	var configOptions = {
		configXMLFile 			: "data-provider/config.xml",
		productsXMLFile 		: "data-provider/products.xml",
		storeName 				: "",
		logoImage 				: "",
		businessEmail 			: "",
		searchProductDetails	: true,
		bs3Theme 				: $('body').hasClass('bs-3') ? true : false, 
		submitRequestBaseURL 	: 'scripts/cart-mailer.php?',
        messages                : {},
        enableQuoteCart         : true
	},
	/*
		General Variables
	*/
	allProductsCollection		= {},
	categoriesCollection		= {},
	currentProductCollection	= {},
	oCurrentProductData			= {},
	searchedProductsCollection	= {},
	cartProductsCollection		= new Array(),
	DateTime					= new Date(),
	cartStats					= {},
	totalBtnMarkup				= '',
	nProductInCart				= false,
	generalVars = {
		categoryIdentfierInURL	: "uid-",
		isStoreLoaded			: false,
		lastAccessedCategory 	: null,
		hashChanged 			: false,
		preventHashChangedAction: false,
		cartStorageName			: 'store-cart-storage'+window.location.hostname,
		qtyUpdateTimeout		: null,
		searchDelayTimeout		: null,
		showSubmitRequestTimeout 	: null,
		enableOrderBtn 			: false,
		isDemoActivate 			: false,
		preventHashChange 		: false,
        lastBreadcrumb          : null
	},
	/*
		DOM elements
	*/
	$domElements = {
		storeLogo					: $('#storeLogo'),
		checkoutSubmitRequestBtn		: $('#checkoutSubmitRequest'),
		loaderContainer				: $('#loaderContainer'),
		mainContainer				: $('#mainContainer'),
		modalCommon					: $('#commonModal'),
		modalContainer 				: configOptions.bs3Theme ? $('.common-modal-content') : $('#commonModal'),
		categoriesList 				: $('#categoriesList'),
		storeLoaderStatusText		: $('.lw-loading-status'),
		productsContainer 			: $('#productsContainer'),
		storeWaitingText 			: $('.lw-waiting-text'),
		addToCartBtnContainer 		: $('#addToCartBtnContainer'),
		productsBreadcrumb 			: $('#productsBreadcrumb'),
		shoppingCartBtnContainer 	: $('.quote-cart-btn-container'),
		searchInput 				: $('input.search-product'),
		clearSearchBtn				: $('.clear-search-result-btn'),
		footerStoreName				: $('.footer-store-name'),
		goToTop						: $('.go-to-top'),
		searchedProductCounts 		: $('#searchedProductCounts'),
        showQuoteCartBtn            : $('.quote-cart-btn-wrapper')
	},

	/*
		Templates to process as _ (underscore templates)
	*/
	_templates = {
		sidebarCategories		: _.template( $("script.sidebar-catgegories-template").html() ),
		productsGrid			: _.template( $("script.products-grid-template").html() ),
		productsDetailsModal	: _.template( $("script.products-details-modal-template").html() ),
		shoppingCartModal		: _.template( $("script.quote-cart-template").html() ),
		addToCartBtn 	 		: _.template( $("script.add-to-cart-btn-template").html() ),
        productAddToCartBtn     : _.template( $("script.products-grid-add-to-cart-btn-template").html() ),
		shoppingCartBtn 	 	: _.template( $("script.quote-cart-btn-template").html() ),
		submitRequestFormModal 	: _.template( $("script.submit-request-form-template").html() ),
        productsBreadcrumb      : _.template( $("script.product-breadcrumb-template").html() ),
        searchResultStatusText  : _.template( $("script.search-result-status-text-template").html() ),
	},

	/*
		Object contains miscellaneous functions as helpers
	*/
	fnMisc = {
		/*
			Create url friendly string
		*/
		convertToSlug	: function(string) {
		    return string
		        .toLowerCase()
		        .replace(/ /g,'-')
		        .replace(/[^\w-]+/g,'')
		        ;
		},
		/*
			extract data from URL & convert it to object
		*/
		dataFromURL		: function() {
			return _.object(
				_.compact(
					_.map(location.hash.slice(1).split('/'), function(urlItem) { 
					 if (urlItem) {
					 	return urlItem.split("id-"); 
					 }
					}))
				);
		},
		/*
			Go to top method
		*/
		goToTop			: function(e) {

			if(e) {
				e.preventDefault();
			}

			$("html, body").animate({
	            scrollTop: "0px"
	        }, {
	            duration: 150,
	            easing: "swing"
	        });
		},
        goToTopModel         : function(e) {

            if(e) {
                e.preventDefault();
            }

            $('.modal').animate({
                scrollTop: "0px"
            }, {
                duration: 150,
                easing: "swing"
            });
        },
		/*
			On resize
		*/
		resizeNPositioin	: function() {
			
			$('head').append(
				'<style> .bs-2 .modal-body { max-height:'+( $(window).height() * 0.4 )+'px;} </style>'
				);

		 	$domElements.loaderContainer.css({
		 		top: ( $(window).height() * 0.5 ) - ( $domElements.loaderContainer.height() * 0.5 ),
		 		left: ( $(window).width() * 0.5 ) - ( $domElements.loaderContainer.width() * 0.5 )
		 	});
		}
	};

	fnMisc.resizeNPositioin();
	$domElements.storeLoaderStatusText.html('Loading configurations...');
	
	/*
		Load Config Data from XML
	*/
	$.ajax({
		type 		: "GET",
		url 		: configOptions.configXMLFile+"?file="+DateTime.getTime(),
		dataType	: "xml",
		success		: function(configData) {

		$domElements.storeLoaderStatusText.html('Loading loaded...');
		
		var configEl = $(configData).find('configuration')[0],
            messagesXmlElement = $(configEl).find('messages')[0],
            orderMessagesXmlElement =   $(messagesXmlElement).find('order_submission')[0],
            successElement = $(orderMessagesXmlElement).find('success'),
            failedElement = $(orderMessagesXmlElement).find('failed');
            /*
                setup messages
             */
            configOptions.messages = {
                init: $(messagesXmlElement).attr('init'),
                loading: $(messagesXmlElement).attr('loading'),
                configLoading: $(messagesXmlElement).attr('configLoading'),

                order: {
                    success_header:  $(successElement).attr('header'),
                    failed_header:  $(failedElement).attr('header'),
                    success: $(orderMessagesXmlElement).find('success').text(),
                    failed: $(orderMessagesXmlElement).find('failed').text()
                }
            };
		
		/*
			logo image 
		*/
		configOptions.logoImage = $(configEl).attr('logoImage');
		configOptions.storeName = $(configEl).attr('storeName');

		$domElements.footerStoreName.html(configOptions.storeName);

        /*
          Business Email
        */
        if($(configEl).attr('enableQuoteCart'))
        {
            configOptions.enableQuoteCart = parseInt($(configEl).attr('enableQuoteCart'));
        }
		
		/*
		  Business Email
		*/
		if($(configEl).attr('businessEmail'))
		{
			configOptions.businessEmail = $(configEl).attr('businessEmail');
		}
		
		/*
			Set logo
		*/
		$domElements.storeLogo.attr('src', configOptions.logoImage);
		
		/*
			Disable Checkout button
		*/ 
		if(configOptions.useSubmitRequestByEmail == 0)
		{
			$domElements.checkoutSubmitRequestBtn.hide();
		}

        if( configOptions.enableQuoteCart ) {
           $('.quote-cart-btn-wrapper').show();
        } else {
            $('.quote-cart-btn-wrapper').hide();
        }

		/*
			basic urls for submit order
		*/ 
		configOptions.submitRequestBaseURL = configOptions.submitRequestBaseURL + '&business='+ configOptions.businessEmail;

		/*
			Update Status
		*/
		$domElements.storeLoaderStatusText.html('Loading products data...');

		/*
			Lets load products data from XML file
		*/
		$.ajax({
	        type: "GET",
	        url: configOptions.productsXMLFile+"?file="+DateTime.getTime(),
	        dataType: "xml",
	        success: function(productsData) {

	        $('#mainContainer').show();
	        $domElements.storeLoaderStatusText.html('Intializating ...');

	        var nCategoryIndex = 0,
	        	nProdductIndex = 0;

	    	/* 
				loop through the categories
	    	*/
	        $(productsData).find('category').each(function(){

	        	var $thisCatgegoryNode 	= $(this),
	        		sThisCategoryName	= $thisCatgegoryNode.attr('categoryName'),
	        		sCategoryID			= $thisCatgegoryNode.attr('categoryID') 
	        								? fnMisc.convertToSlug( $thisCatgegoryNode.attr('categoryID') ) : nCategoryIndex;

	        	categoriesCollection[sCategoryID] = {
	        		name 		: sThisCategoryName,
	        		index 	 	: sCategoryID,
	        		slug 		: fnMisc.convertToSlug( sThisCategoryName ),
                    count       : $($thisCatgegoryNode).find('product').length
	        	};

	        	/*
					loop through the products of this category
	        	*/
	        	$thisCatgegoryNode.find('product').each(function(){

	        		var $thisProductNode 	= $(this),
	        			sThisProductName 	= $thisProductNode.attr('productName'),
	        			sProductID 			= $thisProductNode.attr('productID') 
	        									? fnMisc.convertToSlug( $thisProductNode.attr('productID') ) : nProdductIndex;

	        		/*
						Products
	        		*/
	        		var oThisProduct = allProductsCollection[sProductID] = {
	            		name 				: sThisProductName,
	            		slug 				: fnMisc.convertToSlug( sThisProductName ),
	            		thumbPath 			: $thisProductNode.attr('thumbPath'),
	            		id		 			: $thisProductNode.attr('productID'),
	            		index 				: sProductID,
	            		categoryIndex 		: sCategoryID,
	            		details 			: $thisProductNode.find('details').text()
	            	};

	                /*
						increment product index
	        		*/
	        		nProdductIndex++;
	        	});

				/*
					increment category index
        		*/
	        	nCategoryIndex++;
	        });

        $('.lw-all-category-badge').text(nProdductIndex);

		/*
			we have all the data lets setup a store
		*/
		storeFuncs.loadExistingCartItems();

        }}).fail(function( e ){
        	$domElements.storeWaitingText.html( 'products loading failed!!' )
        	$domElements.storeLoaderStatusText.html( e.statusText );
        });

	}}).fail(function( e ){
        	$domElements.storeWaitingText.html('configuration loading failed!!')
        	$domElements.storeLoaderStatusText.html(e.statusText);
        });

	var storeFuncs = {
		/* 
			setup categories
		*/
		setupCategories : function() {

		$domElements.categoriesList.find(".active-category").after(
				_templates.sidebarCategories ( {categoriesCollection:categoriesCollection} )
			);

			storeFuncs.setupStore();
		},

		/*
			Retrive Cart from local storage & update cart
		*/
		loadExistingCartItems 	: function(){

		    var sRetrivedExistingCartCollation = $.jStorage.get(generalVars.cartStorageName),
		    	retrivedExistingCartCollation = $.parseJSON(sRetrivedExistingCartCollation);
		    if( retrivedExistingCartCollation && retrivedExistingCartCollation.length ){
		        cartProductsCollection = retrivedExistingCartCollation;
		    }

			storeFuncs.updateCart();
		    storeFuncs.setupCategories();
		},
		/* 
			setup products 
		*/
		setupStore 				: function() {

			storeFuncs.onAllComplete();            
            _.delay(storeFuncs.updateCart, 500);
		},
		/* 
			setup products 
		*/
		categoryLinkAction 		: function(e) {
			generalVars.preventHashChangedAction = false;
		},
		/* 
			load products for current catgeory
		*/
		loadCategoryProducts : function( sCategoryID ) {

			storeFuncs.clearSearchResult( true );

			if(sCategoryID == 'all') {
				currentProductCollection = allProductsCollection;
				storeFuncs.updateBreadCrumb('all');
			} else {
				currentProductCollection = _.filter(allProductsCollection, function(productObj){ 
				if(productObj.categoryIndex == sCategoryID) {
						return productObj;
					}
				});

				storeFuncs.updateBreadCrumb(categoriesCollection[sCategoryID]);
			};

			fnMisc.goToTop();

			$domElements.categoriesList.find( 'li' ).removeClass( 'active-category' );
			$domElements.categoriesList.find( '.category-list-item-'+sCategoryID ).addClass('active-category');

			generalVars.lastAccessedCategory = sCategoryID;

			storeFuncs.generateProductsThumbs();
		},
		/* 
			List out the products on page
		*/
		generateProductsThumbs 	: function() {

			if($domElements.productsContainer.data('masonry'))
			{
				$domElements.productsContainer.masonry( 'destroy' )
			}

			$domElements.productsContainer.html(
				_templates.productsGrid( {currentProductCollection:currentProductCollection } )
			);

			$domElements.storeLoaderStatusText.remove();
			$domElements.loaderContainer.show();

			$domElements.productsContainer.imagesLoaded( function() {
		      $domElements.productsContainer.masonry({
		        itemSelector	: '.product-item',
		        "gutter": 10
		      });

		       $('.product-item').addClass('fade-in');
		       $domElements.loaderContainer.hide();

                storeFuncs.updateAddToCartBtns();

		    });
		},
		/* 
			On serach click
		*/
		onSearch 		: function() {

			clearTimeout(generalVars.searchDelayTimeout);

			/* 
				wait for some time if user still typing
			*/
			generalVars.searchDelayTimeout 	= setTimeout(function() {

			if($domElements.searchInput.val() == ""){
				return false;
			}

			$domElements.clearSearchBtn.removeAttr('disabled');

			var oURLData = fnMisc.dataFromURL();
			
			if(oURLData.hasOwnProperty( 'search' )) {
				if ( generalVars.preventHashChangedAction ) {
					generalVars.preventHashChangedAction = false;
					return false;
				}
				storeFuncs.searchProduct();
			} else {
				location.hash = "#/search";
			}
				
			}, 300);
		
		},
		/*
			Clear search result
		*/
		clearSearchResult 	: function(preventSearchResult) {

			$domElements.searchInput.val("");
			$domElements.clearSearchBtn.attr('disabled', '');
			$domElements.searchedProductCounts.html('').removeClass('lw-show-result');

			if(!preventSearchResult)
			{
				storeFuncs.searchProduct();
			}
		},
		/*
			Search for product
		*/
		searchProduct 	: function() {

			$domElements.categoriesList.find('li').removeClass('active-category');

			var sSearchTerm 	= $domElements.searchInput.val(),
				aSeachTerm 		= sSearchTerm.toLowerCase().split(' ');

				
				searchedProductsCollection = allProductsCollection;
				var tempSearchProductCollection = [];

				for ( var i = 0; i < aSeachTerm.length; i++ ) {
					
					var sCurrentSearchTermWord = aSeachTerm[i];

					tempSearchProductCollection = [];
					
					for ( var nProductItem in searchedProductsCollection ) {

						var oProduct = searchedProductsCollection[nProductItem],
							sProductString = oProduct.name.toLowerCase();

							if( configOptions.searchProductDetails ) {
								sProductString += oProduct.details.toLowerCase();
							}


						if ( sProductString.indexOf( sCurrentSearchTermWord ) > -1 ) {
							tempSearchProductCollection.push(oProduct);
						}
	        		}

	        		searchedProductsCollection = tempSearchProductCollection;

				};

				generalVars.lastAccessedCategory = 'search';

				$domElements.searchedProductCounts.html(
                        _templates.searchResultStatusText( { searchedItemsFound:searchedProductsCollection.length } )
                    ).addClass('lw-show-result');

				if( ! _.isEqual(currentProductCollection, searchedProductsCollection) ) {

					currentProductCollection = searchedProductsCollection;
					storeFuncs.generateProductsThumbs();

				}
		},
		/* 
			show product details 
		*/
		productDetails : function( nProdductIndexID ) {

			oCurrentProductData 	= allProductsCollection[nProdductIndexID];

			if( !oCurrentProductData ) {
				return false;
			}

			nProductInCart = storeFuncs.itemExistInCart();


			$domElements.modalContainer.html(
				_templates.productsDetailsModal( {
					oCurrentProductData:oCurrentProductData,
					categoriesCollection:categoriesCollection,
                    enableQuoteCart: configOptions.enableQuoteCart
				} )
			);


			 storeFuncs.updateAddToCartBtn();
			 storeFuncs.openModal();
		},
		/* 
			show shopping cart 
		*/
		showShoppingCart : function( oOptions ) {

			$domElements.modalContainer.html(
				_templates.shoppingCartModal( { 
					cartProductsCollection: cartProductsCollection,
					allProductsCollection: allProductsCollection,
					configOptions: configOptions,
					fnMisc: fnMisc,
					generalVars: generalVars,
					cartStats: cartStats
				} )
			);

			if(oOptions && oOptions.preventModelReLoad) {
				return false;
			} 

			storeFuncs.openModal();

			storeFuncs.updateAddToCartBtn();
			 

		 	if( !generalVars.isStoreLoaded )
			{
				storeFuncs.loadCategoryProducts( 'all' );
			}
		},
		/* 
			let the system know that you back from any of the modal functionality 
			& it don't need to rearange products of that particuler category 
		*/
		backFromModal 			: function() {

			$domElements.mainContainer.removeClass('main-container-addtions');

			if( generalVars.preventHashChange ) {
				generalVars.preventHashChange = false;
				return false;
			}

			generalVars.preventHashChangedAction = true;

			if( generalVars.lastAccessedCategory == 'search' ) {
				location.hash = "#/search";
			} else {
				location.hash = "#/category/uid-"+generalVars.lastAccessedCategory;
			}
		},	
		/* 
			add (or increment product quantity if already in cart) product to cart 
		*/
		addToCart 	: function( e ) {
			e.preventDefault();

            for ( var nCartItem in cartProductsCollection ) {
            	var oCurrentCartItem = cartProductsCollection[nCartItem];

                if ( oCurrentCartItem.index == oCurrentProductData.index ) {
                	/*
						Update if already in cart
                	*/
                    oCurrentCartItem.qty++;

                	storeFuncs.updateCart();
                    return storeFuncs.updateAddToCartBtn();
                }
            }

            /*
				Its not in the cart, lets add it.
        	*/
            cartProductsCollection.push({
            	index 	: oCurrentProductData.index,
            	qty 	: 1
            });

            storeFuncs.updateCart();
            return storeFuncs.updateAddToCartBtn();
		},
        /* 
            add (or increment product quantity if already in cart) product to cart 
            from main page
        */
        productAddToCart    : function( e ) {
            e.preventDefault();

            var $this = $(this),
                productIndex = $this.data('productindex'),
                thisProductInCart   = storeFuncs.itemExistInCart(productIndex),
                listItem            = currentProductCollection[productIndex];

            storeFuncs.showDynamicCartShowBtn();    

            for ( var nCartItem in cartProductsCollection ) {
                var oCurrentCartItem = cartProductsCollection[nCartItem];

                if ( oCurrentCartItem.index == productIndex ) {
                    /*
                        Update if already in cart
                    */
                    oCurrentCartItem.qty++;

                    storeFuncs.updateCart();

                    return storeFuncs.updateAddToCartBtn();
                }
            }

            /*
                Its not in the cart, lets add it.
            */
            cartProductsCollection.push({
                index   : productIndex,
                qty     : 1
            });

            storeFuncs.updateCart();

            return storeFuncs.updateAddToCartBtn();
        },
        showDynamicCartShowBtnDelay: false,
        showDynamicCartShowBtn : function() {
            
            clearTimeout(storeFuncs.showDynamicCartShowBtnDelay);

            $(".dynamic-show-cart-btn").animate({
                                right: "-2px"
                                }, {
                                    duration: 500,
                                    easing: "swing"
                                });

                storeFuncs.showDynamicCartShowBtnDelay  =  setTimeout(function(){
                        $(".dynamic-show-cart-btn").animate({
                                    right: "-400px"
                                    }, {
                                        duration: 500,
                                        easing: "swing"
                                    });
                    }, 4000);
        },
		/*
			Update Shopping cart
		*/
		updateCart 		: function(){

			cartStats.totalItems 	= 0;
			/*
				Store cart in storage, so on refresh of page we can get it again
			*/
            $.jStorage.set( generalVars.cartStorageName, $.toJSON( cartProductsCollection ) );


            for (var nCartItem in cartProductsCollection) {
            	var oCurrentCartItem 		= cartProductsCollection[nCartItem],
            		oCurrentProductItem 	= allProductsCollection[oCurrentCartItem.index];

            		if( !oCurrentProductItem ) {
            			cartProductsCollection = new Array();
            			break;
            		}

                	cartStats.totalItems 	+= oCurrentCartItem.qty;

            }

            generalVars.enableOrderBtn = (cartProductsCollection.length > 0 ) ? true : false;

            storeFuncs.updateAddToCartBtns();

		},
        /*
            store instance of timeout for updating cart & add to cart button
         */
        updateAddToCartBtnsDelay: false,
        /*
            Update add to cart buttons
        */
        updateAddToCartBtns : function() {
  
            clearTimeout(storeFuncs.updateAddToCartBtnsDelay);
                
            storeFuncs.updateAddToCartBtnsDelay = setTimeout(function() { 

                $domElements.shoppingCartBtnContainer.html(
                    _templates.shoppingCartBtn( {cartStats:cartStats, enableQuoteCart: configOptions.enableQuoteCart } )
                );

                for (var nCartItem in allProductsCollection) {

                var oCurrentProductItem = allProductsCollection[nCartItem],
                    productInCart = _.where(cartProductsCollection, {index:nCartItem});

                    productInCart = productInCart[0];

                    if( productInCart && _.isObject(productInCart) ) {
                        
                        $domElements.productsContainer.find('.product-add-to-cart-btn-container-'+oCurrentProductItem.index).html(
                            _templates.productAddToCartBtn( { thisProductInCart: productInCart.qty, listItem:oCurrentProductItem, enableQuoteCart: configOptions.enableQuoteCart } )
                        );

                    } else {
                        
                        $domElements.productsContainer.find('.product-add-to-cart-btn-container-'+oCurrentProductItem.index).html(
                            _templates.productAddToCartBtn( { thisProductInCart: 0, listItem:oCurrentProductItem, enableQuoteCart: configOptions.enableQuoteCart } )
                        );

                    }
                    
            }
                
             }, 200);
        },
		/*
			Update product qty from the cart
		*/
		updateCartItemQty 		: function() {
			clearTimeout( generalVars.qtyUpdateTimeout );
			var $this 			= $(this),
				nQtyValue 		= new Number( $this.val() ),
				nCartRowIndex 	= $this.data('cartrowindex');

				if(nQtyValue < 1) {
					$this.val(1);
					return false;
				}

				generalVars.qtyUpdateTimeout 	= setTimeout(function() {
				cartProductsCollection[nCartRowIndex].qty = nQtyValue;
				storeFuncs.updateCart();

				storeFuncs.showShoppingCart( { preventModelReLoad:true } );
			}, 300);
		},
		/*
			Remove product from cart
		*/
		removeCartItem 		: function(e) {
			var nCartRowIndex 		= $(this).data('cartrowindex');

				cartProductsCollection.splice(nCartRowIndex, 1)
				storeFuncs.updateCart();
				storeFuncs.showShoppingCart( { preventModelReLoad:true } );
		},
		/* 
			Update add to cart button to update
		*/
		updateAddToCartBtn 		: function() {

			$domElements.addToCartBtnContainer 	= $('#addToCartBtnContainer');
			nProductInCart = storeFuncs.itemExistInCart();

			$domElements.addToCartBtnContainer.html(
				_templates.addToCartBtn( { nProductInCart: nProductInCart } )
			);

			 return nProductInCart;
		},
		/*
			Check if the product already in cart 
		*/
		itemExistInCart 	: function( thisProductIndex ) {

            var currentProductIndex = oCurrentProductData.index;

            if( thisProductIndex ) {
                currentProductIndex = thisProductIndex;
            }

			for (var nCartItem in cartProductsCollection) {
            	var oCurrentCartItem = cartProductsCollection[nCartItem];

                if ( oCurrentCartItem.index == currentProductIndex ) {
                    return oCurrentCartItem.qty;
                }                
            };

            return false;
		},
		/*
			Breadcrumb on product Mouseover
		*/
		updateBreadCrumbOnOver 	: function(){
		var nMouseOveredProductIndexID 		= $(this).data('productindex'),
			getMouseOveredProudct 			= allProductsCollection[nMouseOveredProductIndexID],
			getMouseOveredProudctCategory	= categoriesCollection[getMouseOveredProudct.categoryIndex];

			storeFuncs.updateBreadCrumb(getMouseOveredProudctCategory, getMouseOveredProudct);
		},
		/*
			Update product breadcrumb values
		*/
		updateBreadCrumb 	: function(oProudctCategory, oProduct){

            var breadcrumbID = oProudctCategory.index;

            if( oProduct ) {
                breadcrumbID += '-'+oProduct.index;
            }

            if( generalVars.lastBreadcrumb === breadcrumbID) {
                return false;
            }

            generalVars.lastBreadcrumb = breadcrumbID;

            $domElements.productsBreadcrumb.html( _templates.productsBreadcrumb ( { 
                breadCrumbProudctCategory:oProudctCategory,
                breadCrumbProduct:oProduct
            } ) );

		},
		/*
			Go to submit order form
		*/
		proceedToOrderByEmail 	: function(e) {
			e.preventDefault();

			generalVars.preventHashChange = true;

			storeFuncs.closeAllModals();

                clearTimeout(generalVars.showSubmitRequestTimeout);
                generalVars.showSubmitRequestTimeout  = setTimeout(function() {
                    
                    $domElements.modalContainer.html(
                        _templates.submitRequestFormModal
                    );

                    storeFuncs.openModal();

                    $('#submitRequestForm').validate();
                    $('.required').on('keyup change', storeFuncs.validateSubmitRequestForm);

                }, 500);
		},
		/*
			Submit Request
		*/
		submitRequest 			: function(e) {
			e.preventDefault();

             if( storeFuncs.validateSubmitRequestForm() ) {

				if(generalVars.isDemoActivate) {
					return storeFuncs.onRequestSubmitted( { 
						adminMailSent:1,
						customerMailSent:1
					} );
				}

				generalVars.enableOrderBtn = false;

				var submitRequestFormData = $('#submitRequestForm').serialize(),
					submitRequestURL = configOptions.submitRequestBaseURL+ storeFuncs.cartProductsURLGeneration() + '&cartLength=' + (cartProductsCollection.length + 1) + '&' + submitRequestFormData;
			
				$.ajax({
					url: submitRequestURL,
					type: 'POST',
					dataType: 'JSON'
				})
				.done(function(returnData) {

					storeFuncs.onRequestSubmitted( returnData );

				})
				.fail(function() {

					generalVars.enableOrderBtn = false;
                    _.delay(fnMisc.goToTopModel, 300);
                    $('.request-page-header').html(configOptions.messages.order.failed_header);
					$('.request-page-body').html(configOptions.messages.order.failed);
				});
				
    		}
        },

		onRequestSubmitted : function( oReturnData ) {

            $('.request-page-header').html(configOptions.messages.order.success_header);


			if( oReturnData.customerMailSent || oReturnData.adminMailSent ) {

				$('.request-page-body').html(configOptions.messages.order.success);
			}

			$('#backToCartBtn, #submitRequestBtn').hide();
			$('.request-page-close-btn').show();

			cartProductsCollection = new Array();
			storeFuncs.updateCart();

            _.delay(fnMisc.goToTopModel, 300);
		},
		/*
			Check if the form is Validated or not
		*/
		validateSubmitRequestForm 	: function() {

			var isSubmitFormValid = $('#submitRequestForm').valid();

			if( isSubmitFormValid ) {
				$('#submitRequestBtn').removeAttr('disabled');
			} else {
				$('#submitRequestBtn').attr('disabled', 'disabled');
			}

			return isSubmitFormValid;

		},
		/*
			User back from Request submit form Modal to Cart
		*/
		backToCartFromSubmitForm 	: function(e) {
				
			e.preventDefault();
			storeFuncs.closeAllModals();

			generalVars.preventHashChange = true;

			clearTimeout( generalVars.showSubmitRequestTimeout );
			generalVars.showSubmitRequestTimeout 	= setTimeout( function() {
				
				storeFuncs.showShoppingCart( { preventModelReLoad:true } );
				storeFuncs.openModal();

			}, 500);
		},
		/*
			Generating URL to send products to mailer script
		*/
		cartProductsURLGeneration : function() {

		    var itemsCartIndex = 1,
		    	sCartProductsURL = "";

	        for ( var nCartItem in cartProductsCollection ) {
            	var oCurrentCartItem 	= cartProductsCollection[nCartItem],
            		oCurrentProductData 
                            = allProductsCollection[oCurrentCartItem.index];

                sCartProductsURL += '&item_name_'+itemsCartIndex 
                                    + '=' + oCurrentProductData.name
                                    + '&item_number_'+itemsCartIndex 
                                    + '=' + oCurrentProductData.id
                                    + '&quantity_'+itemsCartIndex+'=' 
                                    + oCurrentCartItem.qty;

	            itemsCartIndex ++;
            }

	        return sCartProductsURL;
		},
		/*
			Close all opened Modals
		*/
		closeAllModals 		: function(){
			$domElements.modalCommon.modal('hide');
			$('.modal-backdrop').remove();
		},
		/*
			Open Modal
		*/
		openModal 		: function(){
			storeFuncs.closeAllModals();
			$domElements.modalCommon.modal();
		},
		/*
			Load category based on hash value
		*/
		categoryCalled 		: function( oGetURLData ) {

				if( !oGetURLData.u ) {
					oGetURLData.u = 'all';
				}

				oGetURLData.u = ( categoriesCollection[oGetURLData.u] ) 
                                                    ? oGetURLData.u : 'all';
		
			 	storeFuncs.loadCategoryProducts( oGetURLData.u );
		},
		/*
			Load product details based on hash value
		*/
		productCalled 		: function( oGetURLData ) {

			if( oGetURLData.u ) {
				storeFuncs.productDetails( oGetURLData.u );

				$domElements.mainContainer.addClass('main-container-addtions');

				if( !allProductsCollection[oGetURLData.u] ) {

					storeFuncs.loadCategoryProducts( 'all' );
					return false;
				}

				var nCategoryIndex 
                        = allProductsCollection[oGetURLData.u].categoryIndex;

				if( !generalVars.isStoreLoaded )
				{
					storeFuncs.loadCategoryProducts( nCategoryIndex );
				}

			} else {

			 storeFuncs.loadCategoryProducts( 'all' );
			}
		},

		onAllComplete 		: function() {

			storeFuncs.closeAllModals();

			var oURLData = fnMisc.dataFromURL();

			if( oURLData.hasOwnProperty( 'category' ) ) {

				if ( generalVars.preventHashChangedAction ) {
					generalVars.preventHashChangedAction = false;
					return false;
				}

				storeFuncs.categoryCalled( oURLData );

			} else if( oURLData.hasOwnProperty( 'search' ) ) {

				if ( generalVars.preventHashChangedAction ) {
					generalVars.preventHashChangedAction = false;
					return false;
				}

				storeFuncs.searchProduct();

			} else if( oURLData.hasOwnProperty( 'product' ) ) {

				storeFuncs.productCalled( oURLData );

			} else if( oURLData.hasOwnProperty( 'quote-cart' ) && configOptions.enableQuoteCart ) {

				storeFuncs.showShoppingCart();

				/*if(oURLData.u == 'show') {

					storeFuncs.showShoppingCart();
				}*/				
			} else {
				storeFuncs.loadCategoryProducts( 'all' );
			}

			if( !generalVars.isStoreLoaded )
			{
				generalVars.isStoreLoaded = true;
			}
		}
	};


	$(window).on('hashchange', function() {
	  generalVars.hashChanged = true;
	  storeFuncs.onAllComplete();
	});

	$(window).on( 'resize', fnMisc.resizeNPositioin );

	$domElements.categoriesList.on( 'click', '.category-link', 
                                    storeFuncs.categoryLinkAction );

	$domElements.modalContainer.on( 'click', '.add-to-cart-btn', 
                                                storeFuncs.addToCart );

	$domElements.searchInput.on( 'keyup', storeFuncs.onSearch );

	$domElements.clearSearchBtn.on( 'click', 
		function(){
			storeFuncs.clearSearchResult( false );
		});

	$domElements.modalContainer.on( 'keyup change', 
		'input.cart-product-qty', storeFuncs.updateCartItemQty );

	$domElements.modalContainer.on( 'click', 
		'.delete-product-from-cart', storeFuncs.removeCartItem );

	$domElements.modalContainer.on( 'click', 
		'#checkoutSubmitRequestBtn', storeFuncs.proceedToOrderByEmail );

	$domElements.modalContainer.on('click', 
		'#submitRequestBtn', storeFuncs.submitRequest );

	$domElements.modalContainer.on( 'click', 
		'#backToCartBtn', storeFuncs.backToCartFromSubmitForm );

	$domElements.goToTop.on( 'click', fnMisc.goToTop);

	$domElements.productsContainer.on( 'mouseover', 
		'.product-item', storeFuncs.updateBreadCrumbOnOver );

    $domElements.productsContainer.on( 'click', 
        '.product-add-to-cart-btn', storeFuncs.productAddToCart );

	$domElements.modalCommon.on( 'hidden hidden.bs.modal', 
                                        storeFuncs.backFromModal );
});
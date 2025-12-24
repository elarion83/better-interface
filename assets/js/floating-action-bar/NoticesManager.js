/**
 * NoticesManager: Gère les notifications flottantes avec un processus propre et premium
 * Extrait de initNoticesPositioning pour améliorer la lisibilité et la maintenabilité
 */
(function($) {
	'use strict';
	
	window.NoticesManager = {
		/**
		 * Configuration des sélecteurs pour la détection des notices
		 * Pourquoi: centraliser les sélecteurs pour faciliter la maintenance
		 */
		selectors: {
			// Classes de notices WordPress standard
			notice: '.notice',
			noticeSuccess: '.notice-success, .notice.updated',
			noticeError: '.notice-error',
			noticeWarning: '.notice-warning',
			noticeInfo: '.notice-info',
			// Classes de notices Freemius
			fsNotice: '.fs-notice',
			// Container
			container: '.ngWPAdminUI-notices-container',
			// Boutons de fermeture
			dismissButton: '.notice-dismiss',
			fsCloseButton: '.fs-close',
			// Éléments de contenu
			title: '.fs-plugin-title, .notice-title, h2, h3',
			body: '.notice-body, .fs-notice-body, .notice-content, p',
			// Éléments parent communs pour le titre
			parentContexts: ['.theme', '.plugin-card', '.wrap', '.postbox']
		},
		
		/**
		 * Types de notices supportés
		 * Pourquoi: mapper les classes aux types pour un traitement uniforme
		 */
		noticeTypes: {
			success: ['notice-success', 'updated', 'success'],
			error: ['notice-error', 'error'],
			warning: ['notice-warning', 'warning'],
			info: ['notice-info', 'info']
		},
		
		/**
		 * Initialise le système de gestion des notices
		 * @param {Object} config - Configuration optionnelle
		 */
		init: function(config) {
			var self = this;
			config = config || {};
			
			// Créer le container s'il n'existe pas
			if ($(this.selectors.container).length === 0) {
				$('body').append('<div class="' + this.selectors.container.replace('.', '') + '"></div>');
			}
			
			// Vérifier si on est sur une page d'édition avec le block editor
			if ($('#editor.block-editor__container').length > 0) {
				return; // Ne pas activer le système de notices sur les pages d'édition
			}
			
			// Observer les nouvelles notices qui apparaissent
			this.setupObserver();
			
			// Traiter les notices existantes au chargement
			this.processExistingNotices();
		},
		
		/**
		 * Configure le MutationObserver pour détecter les nouvelles notices
		 * Pourquoi: détecter dynamiquement les notices ajoutées après le chargement
		 */
		setupObserver: function() {
			var self = this;
			
			var observer = new MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {
					mutation.addedNodes.forEach(function(node) {
						if (node.nodeType === 1) { // Element node
							var $node = $(node);
							
							// Vérifier si c'est une notice
							if (self.isNotice($node)) {
								self.processNotice($node);
							}
							
							// Chercher des notices dans les enfants
							$node.find(self.getNoticeSelector()).each(function() {
								self.processNotice($(this));
							});
						}
					});
				});
			});
			
			// Démarrer l'observation
			observer.observe(document.body, {
				childList: true,
				subtree: true
			});
		},
		
		/**
		 * Traite les notices existantes au chargement
		 * Pourquoi: gérer les notices déjà présentes dans le DOM
		 */
		processExistingNotices: function() {
			var self = this;
			$(this.getNoticeSelector()).each(function() {
				self.processNotice($(this));
			});
		},
		
		/**
		 * Retourne le sélecteur combiné pour toutes les notices
		 * Pourquoi: centraliser la logique de sélection
		 */
		getNoticeSelector: function() {
			return this.selectors.notice + ', ' + 
				   this.selectors.noticeSuccess + ', ' + 
				   this.selectors.noticeError + ', ' + 
				   this.selectors.noticeWarning + ', ' + 
				   this.selectors.noticeInfo + ', ' + 
				   this.selectors.fsNotice + ', ' +
				   'div.updated.woocommerce-message#message'; // Messages WooCommerce
		},
		
		/**
		 * Vérifie si un élément est une notice
		 * @param {jQuery} $element - Élément à vérifier
		 * @returns {Boolean}
		 */
		isNotice: function($element) {
			var selector = this.getNoticeSelector();
			// Vérifier les sélecteurs standards
			if ($element.is(selector) || $element.hasClass('notice') || $element.hasClass('fs-notice')) {
				return true;
			}
			// Vérifier spécifiquement les messages WooCommerce
			// Pourquoi: détecter les messages WooCommerce avec la classe .updated.woocommerce-message et l'id #message
			if ($element.is('div.updated.woocommerce-message#message')) {
				return true;
			}
			return false;
		},
		
		/**
		 * Traite une notice : extraction des données et création de la version premium
		 * @param {jQuery} $notice - Élément notice à traiter
		 */
		processNotice: function($notice) {
			// Ignorer les notices déjà traitées ou exclues
			if (this.shouldIgnoreNotice($notice)) {
				return;
			}
			
			// Extraire les données de la notice
			var noticeData = this.extractNoticeData($notice);
			
			// Si la notice n'a pas de contenu valide, l'ignorer
			if (!noticeData.hasContent) {
				return;
			}
			
			// Créer la version premium de la notice
			var $premiumNotice = this.createPremiumNotice(noticeData, $notice);
			
			// Ajouter au container
			this.addToContainer($premiumNotice, $notice);
		},
		
		/**
		 * Vérifie si une notice doit être ignorée
		 * @param {jQuery} $notice - Notice à vérifier
		 * @returns {Boolean}
		 */
		shouldIgnoreNotice: function($notice) {
			// Ignorer les notices déjà dans le container
			if ($notice.closest(this.selectors.container).length > 0) {
				return true;
			}
			
			// Ignorer les notices avec des classes spécifiques
			var excludedClasses = ['plugin-dependencies'];
			for (var i = 0; i < excludedClasses.length; i++) {
				if ($notice.hasClass(excludedClasses[i])) {
					return true;
				}
			}
			
			return false;
		},
		
		/**
		 * Extrait toutes les données d'une notice
		 * @param {jQuery} $notice - Notice à analyser
		 * @returns {Object} Données extraites de la notice
		 */
		extractNoticeData: function($notice) {
			var data = {
				original: $notice,
				text: '',
				title: '',
				type: 'info', // Par défaut
				hasContent: false,
				hasDismiss: false,
				context: ''
			};
			
			// 1. Récupération du texte
			data.text = this.extractText($notice);
			
			// 2. Récupération du titre via élément parent commun
			data.title = this.extractTitle($notice);
			
			// 3. Récupération du type (success, error, warning, info)
			data.type = this.extractType($notice);
			
			// 4. Vérification de la présence d'un bouton dismiss
			data.hasDismiss = this.hasDismissButton($notice);
			
			// 5. Récupération du contexte (thème, plugin, etc.)
			data.context = this.extractContext($notice);
			
			// 6. Vérifier si la notice a du contenu valide
			data.hasContent = this.hasValidContent($notice, data);
			
			return data;
		},
		
		/**
		 * Extrait le texte de la notice (avec préservation des liens HTML)
		 * @param {jQuery} $notice - Notice à analyser
		 * @returns {String} Texte extrait (peut contenir du HTML pour les liens)
		 */
		extractText: function($notice) {
			var htmlContent = '';
			var hasHtml = false;
			
			// Priorité 1: Contenu dans les éléments body spécifiques
			var $body = $notice.find(this.selectors.body).first();
			if ($body.length > 0) {
				// Vérifier s'il y a du HTML (liens, balises, etc.)
				var bodyHtml = $body.html();
				hasHtml = /<[^>]+>/.test(bodyHtml);
				if (hasHtml) {
					// Préserver le HTML avec les liens et autres balises
					var $bodyClone = $body.clone();
					// Retirer uniquement les icônes Dashicons pour éviter les duplications
					// Pourquoi: préserver les liens même si on retire les icônes
					$bodyClone.find('.dashicons, .ngWPAdminUI-notice-icon').each(function(){
						var $icon = $(this);
						var $parentLink = $icon.parent('a');
						// Si l'icône est dans un lien, retirer uniquement l'icône
						if ($parentLink.length > 0) {
							$icon.remove();
						} else {
							$icon.remove();
						}
					});
					htmlContent = $bodyClone.html();
				} else {
					// Pas de HTML, utiliser le texte simple
					htmlContent = $body.text().trim();
				}
			} else {
			// Priorité 2: Texte direct de la notice (sans les boutons et titres)
			var $clone = $notice.clone();
			// Retirer les boutons de fermeture
			$clone.find(this.selectors.dismissButton + ', ' + this.selectors.fsCloseButton).remove();
			// Retirer les titres pour éviter les duplications
			$clone.find(this.selectors.title).remove();
			// Retirer les éléments de contexte (ex: .ngWPAdminUI-notice-context-title)
			$clone.find('.ngWPAdminUI-notice-context-title').remove();
			// Retirer les titres de plugin Freemius
			$clone.find('.fs-plugin-title').remove();
			
			// Vérifier AVANT de retirer les icônes s'il y a du HTML (liens, balises, etc.)
			// Pourquoi: détecter la présence de liens avant de modifier le DOM
			var cloneHtml = $clone.html();
			hasHtml = /<[^>]+>/.test(cloneHtml);
			
			if (hasHtml) {
				// Retirer les icônes Dashicons pour éviter les duplications
				// Pourquoi: les icônes sont ajoutées dans le titre premium, pas besoin de les garder dans le texte
				// IMPORTANT: préserver les liens même si on retire les icônes
				$clone.find('.dashicons, .ngWPAdminUI-notice-icon').each(function(){
					var $icon = $(this);
					var $parentLink = $icon.parent('a');
					// Si l'icône est dans un lien, retirer uniquement l'icône, pas le lien
					if ($parentLink.length > 0) {
						$icon.remove();
						// Si le lien devient vide, ajouter le texte du href comme contenu de secours
						if ($parentLink.text().trim().length === 0 && $parentLink.attr('href')) {
							var hrefText = $parentLink.attr('href');
							// Utiliser le texte du lien ou l'URL si pas de texte
							$parentLink.text(hrefText);
						}
					} else {
						$icon.remove();
					}
				});
				// Préserver le HTML avec les liens et autres balises
				htmlContent = $clone.html();
			} else {
				// Pas de HTML, retirer les icônes et utiliser le texte simple
				$clone.find('.dashicons, .ngWPAdminUI-notice-icon').remove();
				htmlContent = $clone.text().trim();
			}
			}
			
			// Nettoyer le texte (uniquement si c'est du texte simple, pas du HTML)
			if (!hasHtml) {
				htmlContent = this.cleanText(htmlContent);
			} else {
				// Si c'est du HTML, nettoyer uniquement les espaces multiples dans le texte
				// Pourquoi: préserver tous les liens et balises HTML présents dans les notifications
				htmlContent = htmlContent.replace(/\s+/g, ' ').trim();
			}
			
			return htmlContent;
		},
		
		/**
		 * Nettoie le texte extrait pour éviter les duplications et problèmes
		 * @param {String} text - Texte à nettoyer
		 * @returns {String} Texte nettoyé
		 */
		cleanText: function(text) {
			if (!text) return '';
			
			// Retirer les espaces multiples
			text = text.replace(/\s+/g, ' ').trim();
			
			// Corriger les duplications courantes (ex: "PluginsPlugin" -> "Plugin")
			text = text.replace(/\bPluginsPlugin\b/gi, 'Plugin');
			text = text.replace(/\bThemesTheme\b/gi, 'Theme');
			text = text.replace(/\bPostsPost\b/gi, 'Post');
			text = text.replace(/\bPagesPage\b/gi, 'Page');
			
			// Retirer les répétitions de mots consécutifs (ex: "Plugin Plugin" -> "Plugin")
			text = text.replace(/\b(\w+)\s+\1\b/gi, '$1');
			
			// Nettoyer à nouveau les espaces après les corrections
			text = text.replace(/\s+/g, ' ').trim();
			
			return text;
		},
		
		/**
		 * Extrait le titre via un élément parent commun
		 * @param {jQuery} $notice - Notice à analyser
		 * @returns {String} Titre extrait
		 */
		extractTitle: function($notice) {
			// Priorité 0: Messages WooCommerce spécifiques
			// Pourquoi: traiter les messages WooCommerce avec le titre "WooCommerce"
			// Détection flexible pour s'assurer de capturer tous les messages WooCommerce
			if ($notice.is('div.updated.woocommerce-message#message') || 
				($notice.hasClass('updated') && $notice.hasClass('woocommerce-message') && $notice.attr('id') === 'message') ||
				($notice.hasClass('updated') && $notice.hasClass('woocommerce-message'))) {
				return 'WooCommerce';
			}
			
			// Priorité 1: Titre dans la notice elle-même
			var $titleInNotice = $notice.find(this.selectors.title).first();
			if ($titleInNotice.length > 0) {
				return $titleInNotice.text().trim();
			}
			
			// Priorité 2: Titre via élément parent commun
			for (var i = 0; i < this.selectors.parentContexts.length; i++) {
				var $parent = $notice.closest(this.selectors.parentContexts[i]);
				if ($parent.length > 0) {
					// Pour les thèmes
					if (this.selectors.parentContexts[i] === '.theme') {
						var themeSlug = $parent.attr('data-slug');
						if (themeSlug) {
							return this.formatSlugToTitle(themeSlug);
						}
					}
					// Pour les plugins
					if (this.selectors.parentContexts[i] === '.plugin-card') {
						var $pluginTitle = $parent.find('.plugin-title, h3').first();
						if ($pluginTitle.length > 0) {
							return $pluginTitle.text().trim();
						}
					}
					// Pour les postbox
					if (this.selectors.parentContexts[i] === '.postbox') {
						var $postboxTitle = $parent.find('h2, h3, .hndle').first();
						if ($postboxTitle.length > 0) {
							return $postboxTitle.text().trim();
						}
					}
				}
			}
			
			// Priorité 3: Titre depuis le h1 de la page
			var $pageTitle = $('h1.wp-heading-inline, h1').first();
			if ($pageTitle.length > 0) {
				return $pageTitle.text().trim();
			}
			
			return '';
		},
		
		/**
		 * Formate un slug en titre lisible
		 * @param {String} slug - Slug à formater
		 * @returns {String} Titre formaté
		 */
		formatSlugToTitle: function(slug) {
			return slug.replace(/-/g, ' ').replace(/\b\w/g, function(l) { 
				return l.toUpperCase(); 
			});
		},
		
		/**
		 * Extrait le type de la notice (success, error, warning, info)
		 * @param {jQuery} $notice - Notice à analyser
		 * @returns {String} Type de notice
		 */
		extractType: function($notice) {
			// Vérifier spécifiquement les messages WooCommerce
			// Pourquoi: les messages WooCommerce sont de type info
			if ($notice.is('div.updated.woocommerce-message#message')) {
				return 'info';
			}
			
			// Vérifier les classes de type
			for (var type in this.noticeTypes) {
				var classes = this.noticeTypes[type];
				for (var i = 0; i < classes.length; i++) {
					if ($notice.hasClass(classes[i]) || $notice.hasClass('notice-' + classes[i])) {
						return type;
					}
				}
			}
			
			// Vérifier les classes Freemius
			if ($notice.hasClass('fs-notice')) {
				if ($notice.hasClass('success') || $notice.hasClass('updated')) {
					return 'success';
				}
				if ($notice.hasClass('error')) {
					return 'error';
				}
				if ($notice.hasClass('warning')) {
					return 'warning';
				}
			}
			
			// Par défaut: info
			return 'info';
		},
		
		/**
		 * Vérifie si la notice a un bouton dismiss
		 * @param {jQuery} $notice - Notice à vérifier
		 * @returns {Boolean}
		 */
		hasDismissButton: function($notice) {
			return $notice.find(this.selectors.dismissButton + ', ' + this.selectors.fsCloseButton).length > 0 ||
				   $notice.hasClass('is-dismissible') ||
				   $notice.hasClass('fs-sticky');
		},
		
		/**
		 * Extrait le contexte de la notice (thème, plugin, etc.)
		 * @param {jQuery} $notice - Notice à analyser
		 * @returns {String} Contexte
		 */
		extractContext: function($notice) {
			// Vérifier si c'est dans un contexte de thème
			var $themeDiv = $notice.closest('.theme');
			if ($themeDiv.length > 0) {
				return 'theme';
			}
			
			// Vérifier si c'est dans un contexte de plugin
			var $pluginCard = $notice.closest('.plugin-card');
			if ($pluginCard.length > 0) {
				return 'plugin';
			}
			
			return '';
		},
		
		/**
		 * Vérifie si la notice a un contenu valide
		 * @param {jQuery} $notice - Notice à vérifier
		 * @param {Object} data - Données extraites
		 * @returns {Boolean}
		 */
		hasValidContent: function($notice, data) {
			// Contrainte: si le texte est vide, ne pas afficher la notice
			if (!data.text || data.text.trim().length === 0) {
				return false;
			}
			
			// Vérifier si le texte est suffisamment long (au moins 3 caractères)
			if (data.text && data.text.trim().length >= 3) {
				return true;
			}
			
			return false;
		},
		
		/**
		 * Crée une version premium de la notice avec design moderne
		 * @param {Object} data - Données de la notice
		 * @param {jQuery} $original - Notice originale
		 * @returns {jQuery} Notice premium créée
		 */
		createPremiumNotice: function(data, $original) {
			var self = this;
			
			// Cloner la notice originale pour préserver les fonctionnalités
			var $premiumNotice = $original.clone();
			
			// Ajouter les classes premium
			$premiumNotice.addClass('ngWPAdminUI-premium-notice ngWPAdminUI-notice-' + data.type);
			
			// Structure premium avec titre et contenu
			var $premiumContent = $('<div class="ngWPAdminUI-premium-notice-content"></div>');
			
			// Ajouter le titre si disponible
			if (data.title) {
				// Vérifier si le titre est déjà présent dans le texte pour éviter les duplications
				// Exception: toujours afficher le titre pour les messages WooCommerce
				// Pourquoi: détecter les messages WooCommerce de manière plus flexible
				var isWooCommerce = $original.is('div.updated.woocommerce-message#message') || 
									($original.hasClass('updated') && $original.hasClass('woocommerce-message') && $original.attr('id') === 'message') ||
									($original.hasClass('updated') && $original.hasClass('woocommerce-message'));
				var titleInText = data.text && data.text.toLowerCase().includes(data.title.toLowerCase());
				
				// Afficher le titre si : pas dans le texte OU c'est un message WooCommerce
				if (!titleInText || isWooCommerce) {
					// Obtenir l'icône selon le type de notice
					var icon = this.getNoticeIcon(data.type);
					var $premiumTitle = $('<div class="ngWPAdminUI-premium-notice-title"></div>');
					
					// Ajouter l'icône si disponible
					if (icon) {
						$premiumTitle.append('<span class="ngWPAdminUI-notice-icon dashicons ' + icon + '"></span>');
					}
					
					// Ajouter le texte du titre
					$premiumTitle.append('<span class="ngWPAdminUI-notice-title-text">' + this.escapeHtml(data.title) + '</span>');
					
					$premiumContent.append($premiumTitle);
				}
			}
			
			// Ajouter le texte (nettoyé pour retirer le titre s'il est présent)
			// Pourquoi: préserver les liens HTML présents dans les notifications originales
			if (data.text) {
				var cleanText = data.text;
				var hasHtml = /<[^>]+>/.test(cleanText); // Vérifier si le texte contient du HTML
				var isWooCommerce = $original.is('div.updated.woocommerce-message#message') || 
									($original.hasClass('updated') && $original.hasClass('woocommerce-message') && $original.attr('id') === 'message') ||
									($original.hasClass('updated') && $original.hasClass('woocommerce-message'));
				
				// Retirer le titre du texte s'il est présent au début
				// Pour les messages WooCommerce, toujours retirer "WooCommerce" du texte pour éviter la duplication
				if (data.title && (!hasHtml || isWooCommerce)) {
					var titleRegex = new RegExp('^' + this.escapeRegex(data.title) + '\\s*', 'i');
					cleanText = cleanText.replace(titleRegex, '');
					// Pour WooCommerce, aussi retirer si présent ailleurs dans le texte (au début d'une phrase)
					if (isWooCommerce) {
						cleanText = cleanText.replace(new RegExp('\\b' + this.escapeRegex(data.title) + '\\s*:?\\s*', 'gi'), '');
					}
				}
				
				// Si le texte contient du HTML (liens), l'insérer tel quel, sinon échapper
				if (hasHtml) {
					// Le texte contient déjà du HTML (liens), l'utiliser directement
					// Retirer les icônes Dashicons du texte pour éviter les duplications
					var $tempDiv = $('<div>').html(cleanText.trim());
					$tempDiv.find('.dashicons, .ngWPAdminUI-notice-icon').remove();
					cleanText = $tempDiv.html();
					
					var $premiumText = $('<div class="ngWPAdminUI-premium-notice-text"></div>');
					$premiumText.html(cleanText.trim());
					$premiumContent.append($premiumText);
				} else {
					// Texte simple, échapper pour sécurité
					var $premiumText = $('<div class="ngWPAdminUI-premium-notice-text">' + this.escapeHtml(cleanText.trim()) + '</div>');
					$premiumContent.append($premiumText);
				}
			}
			
			// Remplacer le contenu de la notice
			$premiumNotice.html($premiumContent);
			
			// Toujours créer un bouton dismiss premium (même si la notice originale n'en a pas)
			// Pourquoi: permettre de fermer toutes les notices, même celles sans bouton dismiss original
			this.setupDismissButton($premiumNotice, $original, data.hasDismiss);
			
			// Préserver les événements et attributs de la notice originale
			this.preserveOriginalFunctionality($premiumNotice, $original);
			
			return $premiumNotice;
		},
		
		/**
		 * Configure le bouton dismiss de manière premium
		 * @param {jQuery} $premiumNotice - Notice premium
		 * @param {jQuery} $original - Notice originale
		 * @param {Boolean} hasOriginalDismiss - Si la notice originale a un bouton dismiss
		 */
		setupDismissButton: function($premiumNotice, $original, hasOriginalDismiss) {
			var self = this;
			var Config = window.WPAdminUI && window.WPAdminUI.Config ? window.WPAdminUI.Config : {};
			var animationDelay = Config.timings && Config.timings.noticeAnimation ? Config.timings.noticeAnimation : 300;
			
			// Créer le bouton dismiss premium (toujours créé, même si la notice originale n'en a pas)
			var $dismissButton = $('<button type="button" class="ngWPAdminUI-premium-dismiss" aria-label="Fermer"><span class="dashicons dashicons-no-alt"></span></button>');
			
			// Gérer le clic sur le bouton dismiss
			$dismissButton.on('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				
				// Empêcher les clics multiples pendant la fermeture
				if ($premiumNotice.hasClass('ngWPAdminUI-notice-closing')) {
					return;
				}
				
				// Marquer la notice comme en cours de fermeture
				$premiumNotice.addClass('ngWPAdminUI-notice-closing');
				
				// Déclencher le dismiss de la notice originale si elle existe
				if (hasOriginalDismiss) {
					var $originalDismiss = $original.find(self.selectors.dismissButton + ', ' + self.selectors.fsCloseButton);
					if ($originalDismiss.length > 0) {
						$originalDismiss.trigger('click');
					}
				}
				
				// Masquer la notice originale si elle n'a pas de dismiss
				if (!hasOriginalDismiss && $original.length > 0) {
					$original.fadeOut(animationDelay, function() {
						$original.remove();
					});
				} else if (hasOriginalDismiss && $original.length > 0) {
					// Si la notice originale a un dismiss, attendre un peu avant de la masquer
					// Pourquoi: laisser le temps au dismiss WordPress de s'exécuter
					setTimeout(function() {
						if ($original.is(':visible')) {
							$original.fadeOut(animationDelay, function() {
								$original.remove();
							});
						}
					}, 100);
				}
				
				// Fermer la notice premium avec animation
				// Pourquoi: utiliser le délai de la config pour la cohérence
				setTimeout(function() {
					if ($premiumNotice && $premiumNotice.length > 0) {
						$premiumNotice.remove();
					}
				}, animationDelay);
			});
			
			// Ajouter le bouton à la notice
			$premiumNotice.append($dismissButton);
			$premiumNotice.addClass('ngWPAdminUI-notice-dismissible');
		},
		
		/**
		 * Préserve les fonctionnalités de la notice originale
		 * @param {jQuery} $premiumNotice - Notice premium
		 * @param {jQuery} $original - Notice originale
		 */
		preserveOriginalFunctionality: function($premiumNotice, $original) {
			// Copier les attributs data- importants
			var dataAttributes = ['data-id', 'data-plugin', 'data-theme', 'data-notice-id'];
			for (var i = 0; i < dataAttributes.length; i++) {
				var attr = dataAttributes[i];
				var value = $original.attr(attr);
				if (value) {
					$premiumNotice.attr(attr, value);
				}
			}
			
			// Préserver les classes importantes
			var importantClasses = ['is-dismissible', 'fs-sticky', 'fs-notice'];
			for (var j = 0; j < importantClasses.length; j++) {
				if ($original.hasClass(importantClasses[j])) {
					$premiumNotice.addClass(importantClasses[j]);
				}
			}
		},
		
		/**
		 * Ajoute la notice au container
		 * @param {jQuery} $premiumNotice - Notice premium
		 * @param {jQuery} $original - Notice originale
		 */
		addToContainer: function($premiumNotice, $original) {
			var $container = $(this.selectors.container);
			
			// Masquer la notice originale
			$original.hide();
			
			// Ajouter la notice premium au container
			$container.append($premiumNotice);
			
			// Animation d'entrée
			setTimeout(function() {
				$premiumNotice.addClass('ngWPAdminUI-notice-visible');
			}, 10);
		},
		
		/**
		 * Échappe le HTML pour éviter les injections XSS
		 * @param {String} text - Texte à échapper
		 * @returns {String} Texte échappé
		 */
		escapeHtml: function(text) {
			var div = document.createElement('div');
			div.textContent = text;
			return div.innerHTML;
		},
		
		/**
		 * Échappe les caractères spéciaux pour les regex
		 * @param {String} text - Texte à échapper
		 * @returns {String} Texte échappé pour regex
		 */
		escapeRegex: function(text) {
			return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		},
		
		/**
		 * Retourne l'icône Dashicons appropriée selon le type de notice
		 * @param {String} type - Type de notice (success, error, warning, info)
		 * @returns {String} Classe Dashicons ou null
		 */
		getNoticeIcon: function(type) {
			// Pourquoi: utiliser les icônes WordPress Dashicons pour une cohérence visuelle
			var icons = {
				success: 'dashicons-yes-alt',
				error: 'dashicons-dismiss',
				warning: 'dashicons-warning',
				info: 'dashicons-info'
			};
			
			return icons[type] || null;
		}
	};
	
})(jQuery);


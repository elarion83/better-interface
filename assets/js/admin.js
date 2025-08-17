(function($){
	// BetterInterfaceAdmin: gère les interactions de la page d’admin
	function BetterInterfaceAdmin(){
		this.currentMode = (window.bi_ajax && bi_ajax.current_mode) || 'default';
		this.availableModes = (window.bi_ajax && bi_ajax.available_modes) || {};
		this.currentColorTheme = (window.bi_ajax && bi_ajax.current_color_theme) || 'ocean';
		this.availableColorThemes = (window.bi_ajax && bi_ajax.available_color_themes) || {};
		this.ajaxUrl = (window.bi_ajax && bi_ajax.ajax_url) || ajaxurl;
		this.nonce = (window.bi_ajax && bi_ajax.nonce) || '';

		this.selectedMode = null;
		this.selectedTheme = null;
	}

	BetterInterfaceAdmin.prototype.init = function(){
		this.initAccordionTables();
		this.bindRowBackgroundSelect();
		this.bindRowCheckboxSync();
		this.initializeSelectedRowsState();
		this.initPageTransition();
		this.initNoticesPositioning();
	};



	// ===== Barre d'actions flottante (desktop/tablette paysage) =====
	BetterInterfaceAdmin.prototype.initAccordionTables = function(){
		var self = this;
		$('.tablenav.top').each(function(){
			var $nav = $(this);
			if ($nav.data('biAccordionInit')) return;
			$nav.data('biAccordionInit', true);

			self.groupTableActions($nav);
			
					// Sur desktop/tablette paysage : créer une barre flottante
		if (window.innerWidth >= 768) {
			self.createFloatingActionBar($nav);
		} else {
			// Sur mobile/tablette portrait : garder l'accordéon
			$nav.addClass('bi-accordion-closed');
			$nav.on('click', function(e){
				var $target = $(e.target);
				if (self.isInteractive($target)) return;
				self.toggleAccordion($nav);
			});
		}
		
		// Gérer le redimensionnement de la fenêtre
		$(window).on('resize', function(){
			var isDesktop = window.innerWidth >= 768;
			var hasFloatingBar = $('.bi-floating-action-bar').length > 0;
			
			if (isDesktop && !hasFloatingBar) {
				// Passer en mode desktop : créer la barre flottante
				$('.tablenav.top').each(function(){
					var $nav = $(this);
					if (!$nav.data('biAccordionInit')) return;
					$nav.removeClass('bi-accordion-closed bi-accordion-open');
					$nav.off('click');
					self.createFloatingActionBar($nav);
				});
			} else if (!isDesktop && hasFloatingBar) {
				// Passer en mode mobile : supprimer la barre flottante et restaurer l'accordéon
				$('.bi-floating-action-bar').remove();
				$('.tablenav.top').each(function(){
					var $nav = $(this);
					if (!$nav.data('biAccordionInit')) return;
					$nav.show();
					$nav.addClass('bi-accordion-closed');
					$nav.on('click', function(e){
						var $target = $(e.target);
						if (self.isInteractive($target)) return;
						self.toggleAccordion($nav);
					});
				});
			}
		});
		});
	};

	BetterInterfaceAdmin.prototype.isInteractive = function($el){
		return $el.is('button, input, select, textarea, a, label, [contenteditable="true"]') || $el.closest('button, input, select, textarea, a, label, [contenteditable="true"]').length > 0;
	};

	BetterInterfaceAdmin.prototype.toggleAccordion = function($nav){
		var isOpen = $nav.hasClass('bi-accordion-open');
		$nav.toggleClass('bi-accordion-open', !isOpen);
		$nav.toggleClass('bi-accordion-closed', isOpen);
	};

	BetterInterfaceAdmin.prototype.groupTableActions = function($nav){
		var $actionsBlocks = $nav.find('.actions');
		if ($actionsBlocks.length === 0) return;

		var $host = $actionsBlocks.first();
		var $others = $actionsBlocks.slice(1);

		var $container = $('<div/>', { class: 'bi-grouped-actions' });
		var $actionsSection = $('<div/>', { class: 'bi-actions-section' });
		var $filtersSection = $('<div/>', { class: 'bi-filters-section' });

		$actionsBlocks.each(function(){
			var $block = $(this);
			$block.children().each(function(){
				var $child = $(this);
				var bucket = classify($child);
				if (bucket === 'actions') { $actionsSection.append($child); }
				else { $filtersSection.append($child); }
			});
		});

		$container.append($actionsSection).append($filtersSection);

		// Supprimer les sections vides pour masquer les pastilles correspondantes
		var hasActions = $actionsSection.children().length > 0 && ($actionsSection.text()||'').trim() !== '';
		var hasFilters = $filtersSection.children().length > 0 && ($filtersSection.text()||'').trim() !== '';
		if (!hasActions) { $actionsSection.remove(); }
		if (!hasFilters) { $filtersSection.remove(); }
		if (!hasActions && !hasFilters) {
			// Aucun contenu pertinent: ne pas insérer le container
			$others.remove();
			return;
		}

		$host.empty().append($container);
		$others.remove();

		function classify($el){
			// 1) Wrappers/éléments spécifiques aux actions groupées
			if ($el.hasClass('bulkactions') || $el.closest('.bulkactions').length) return 'actions';
			if ($el.find('select[name="action"], select[name="action2"]').length) return 'actions';
			if ($el.find('input[id^="doaction"]').length) return 'actions';
			if ($el.is('select')) {
				var n = ($el.attr('name')||'').toLowerCase();
				if (n === 'action' || n === 'action2') return 'actions';
			}
			if ($el.is('input[type="submit"], button')) {
				var id = ($el.attr('id')||'').toLowerCase();
				var name = ($el.attr('name')||'').toLowerCase();
				var text = (($el.text()||$el.val()||'')+"").toLowerCase();
				if (id.indexOf('doaction') === 0 || name === 'doaction' || name === 'doaction2') return 'actions';
				if (id === 'post-query-submit' || /filtrer|filter/.test(text)) return 'filters';
			}
			// 2) Filtres (champs et sélecteurs hors actions)
			if ($el.is('select')) return 'filters';
			if ($el.find('select').length) {
				if ($el.find('select[name="action"], select[name="action2"]').length) return 'actions';
				return 'filters';
			}
			if ($el.is('input[type="search"], input[type="text"], input[type="date"], input[type="number"], input[type="month"], input[type="time"]')) return 'filters';
			if ($el.find('input[type="search"], input[type="text"], input[type="date"], input[type="number"], input[type="month"], input[type="time"]').length) return 'filters';
			// 3) Par défaut, ranger dans Filtres pour éviter de polluer la zone Actions
			return 'filters';
		}
	};

	// Créer une barre d'actions flottante en bas de l'écran
	BetterInterfaceAdmin.prototype.createFloatingActionBar = function($nav){
		var self = this;
		
		// Créer le container de la barre flottante
		var $floatingBar = $('<div class="bi-floating-action-bar"></div>');
		var $actionsContainer = $('<div class="bi-floating-actions"></div>');
		var $filtersContainer = $('<div class="bi-floating-filters"></div>');
		
		// Créer le compteur d'éléments sélectionnés
		var $counter = $('<div class="bi-selection-counter">0 selected</div>');
		$actionsContainer.append($counter);
		
		// Créer des références visuelles sans déplacer les éléments originaux
		$nav.find('.bi-actions-section > *').each(function(){
			var $original = $(this);
			var $clone = $original.clone();
			
			// Copier les attributs importants
			$clone.attr('id', $original.attr('id'));
			$clone.attr('name', $original.attr('name'));
			$clone.attr('form', $original.attr('form'));
			$clone.attr('type', $original.attr('type'));
			$clone.attr('value', $original.attr('value'));
			
			// Pour les boutons, déclencher l'action sur l'original
			if ($clone.is('button, input[type="submit"]')) {
				$clone.on('click', function(e){
					e.preventDefault();
					$original.trigger('click');
				});
			}
			
			// Pour les selects, synchroniser avec l'original
			if ($clone.is('select')) {
				$clone.on('change', function(){
					$original.val($(this).val()).trigger('change');
				});
				$original.on('change', function(){
					$clone.val($(this).val());
				});
			}
			
			// Pour les inputs, synchroniser avec l'original
			if ($clone.is('input[type="text"], input[type="search"], input[type="date"], input[type="number"]')) {
				$clone.on('input', function(){
					$original.val($(this).val()).trigger('input');
				});
				$original.on('input', function(){
					$clone.val($(this).val());
				});
			}
			
			$actionsContainer.append($clone);
		});
		
		$nav.find('.bi-filters-section > *').each(function(){
			var $original = $(this);
			var $clone = $original.clone();
			
			// Copier les attributs importants
			$clone.attr('id', $original.attr('id') + '-floating');
			$clone.attr('name', $original.attr('name'));
			$clone.attr('form', $original.attr('form'));
			$clone.attr('type', $original.attr('type'));
			$clone.attr('value', $original.attr('value'));
			
			// Pour les boutons, déclencher l'action sur l'original
			if ($clone.is('button, input[type="submit"]')) {
				$clone.on('click', function(e){
					e.preventDefault();
					$original.trigger('click');
				});
			}
			
			// Pour les selects, synchroniser avec l'original
			if ($clone.is('select')) {
				$clone.on('change', function(){
					$original.val($(this).val()).trigger('change');
				});
				$original.on('change', function(){
					$clone.val($(this).val());
				});
			}
			
			// Pour les inputs, synchroniser avec l'original
			if ($clone.is('input[type="text"], input[type="search"], input[type="date"], input[type="number"]')) {
				$clone.on('input', function(){
					$original.val($(this).val()).trigger('input');
				});
				$original.on('input', function(){
					$clone.val($(this).val());
				});
			}
			
			$filtersContainer.append($clone);
		});
		
		// Assembler la barre
		if ($actionsContainer.children().length > 0) {
			$floatingBar.append($actionsContainer);
		}
		if ($filtersContainer.children().length > 0) {
			$floatingBar.append($filtersContainer);
		}
		
		// Ajouter au body si on a du contenu
		if ($floatingBar.children().length > 0) {
			$('body').append($floatingBar);
			
			// Gérer l'état des actions selon la sélection
			self.updateFloatingBarState();
			
			// Écouter les changements de sélection
			$(document).on('change', '.wp-list-table input[type="checkbox"]', function(){
				self.updateFloatingBarState();
			});
			
			// Masquer la navigation originale seulement sur desktop
			if (window.innerWidth >= 768) {
				$nav.hide();
			}
		}
	};

	// Mettre à jour l'état de la barre flottante (activer/désactiver les actions)
	BetterInterfaceAdmin.prototype.updateFloatingBarState = function(){
		var selectedCount = $('.wp-list-table tbody input[type="checkbox"]:checked').length;
		var hasSelectedItems = selectedCount > 0;
		var $actions = $('.bi-floating-actions button, .bi-floating-actions input[type="submit"], .bi-floating-actions select');
		var $counter = $('.bi-selection-counter');
		
		// Mettre à jour le compteur
		if (selectedCount === 0) {
			$counter.text('0 selected');
		} else if (selectedCount === 1) {
			$counter.text('1 selected');
		} else {
			$counter.text(selectedCount + ' selected');
		}
		
		if (hasSelectedItems) {
			$actions.prop('disabled', false).removeClass('disabled');
			$counter.addClass('has-selection');
		} else {
			$actions.prop('disabled', true).addClass('disabled');
			$counter.removeClass('has-selection');
		}
	};

	// Pourquoi: améliorer l'ergonomie des listes WP; un clic sur l'arrière-plan d'une ligne toggle la première case à cocher
	BetterInterfaceAdmin.prototype.bindRowBackgroundSelect = function(){
		var self = this;
		$(document).on('click', '.wp-list-table tbody tr', function(e){
			var $target = $(e.target);
			if (self.isInteractive($target)) return;
			var $row = $(this);
			var $checkbox = $row.find('th.check-column input[type="checkbox"], td.check-column input[type="checkbox"], input[type="checkbox"]').first();
			if ($checkbox.length === 0) return;
			var nextState = !$checkbox.prop('checked');
			$checkbox.prop('checked', nextState).trigger('change');
			self.updateRowSelectedState($row, nextState);
		});
	};

	// Pourquoi: garder l'état visuel de sélection en phase avec les cases à cocher (sélections individuelles et "tout sélectionner")
	BetterInterfaceAdmin.prototype.bindRowCheckboxSync = function(){
		var self = this;
		// Cases par ligne
		$(document).on('change', '.wp-list-table tbody tr input[type="checkbox"]', function(){
			var $row = $(this).closest('tr');
			self.updateRowSelectedState($row, $(this).prop('checked'));
		});
		// Cases "tout sélectionner" (thead/tfoot)
		$(document).on('change', '.wp-list-table thead input[type="checkbox"], .wp-list-table tfoot input[type="checkbox"]', function(){
			$('.wp-list-table tbody tr').each(function(){
				var $row = $(this);
				var $checkbox = $row.find('th.check-column input[type="checkbox"], td.check-column input[type="checkbox"]').first();
				if ($checkbox.length) {
					self.updateRowSelectedState($row, $checkbox.prop('checked'));
				}
			});
		});
	};

	// Met à jour la classe de sélection sur la ligne (pour les styles modernes)
	BetterInterfaceAdmin.prototype.updateRowSelectedState = function($row, isSelected){
		$row.toggleClass('bi-row-selected', !!isSelected);
	};

	// À l'init: synchroniser l'état visuel des lignes déjà sélectionnées
	BetterInterfaceAdmin.prototype.initializeSelectedRowsState = function(){
		var self = this;
		$('.wp-list-table tbody tr').each(function(){
			var $row = $(this);
			var $checkbox = $row.find('th.check-column input[type="checkbox"], td.check-column input[type="checkbox"]').first();
			if ($checkbox.length) {
				self.updateRowSelectedState($row, $checkbox.prop('checked'));
			}
		});
	};

	// ===== TRANSITION DE PAGE SMOOTH =====
	// Pourquoi: créer une transition fluide lors des changements de page pour une meilleure UX
	BetterInterfaceAdmin.prototype.initPageTransition = function(){
		var self = this;
		
		// Créer l'overlay de transition s'il n'existe pas
		if ($('.bi-page-transition-overlay').length === 0) {
			$('body').append('<div class="bi-page-transition-overlay"></div>');
		}

		// Intercepter les clics sur les liens de navigation
		$(document).on('click', 'a[href*="admin.php"], a[href*="post.php"], a[href*="edit.php"], a[href*="upload.php"], a[href*="users.php"], a[href*="plugins.php"], a[href*="themes.php"], a[href*="options-general.php"], a[href*="tools.php"], a[href*="edit-comments.php"]', function(e){
			var href = $(this).attr('href');
			
			// Ignorer les liens avec des ancres ou des paramètres spécifiques
			if (href.indexOf('#') === 0 || href.indexOf('javascript:') === 0) return;
			
			// Ignorer les liens qui ouvrent dans un nouvel onglet
			if ($(this).attr('target') === '_blank') return;
			
			// Ignorer les liens de téléchargement
			if (href.indexOf('download') !== -1 || href.indexOf('export') !== -1) return;
			
			// Activer la transition
			self.showPageTransition();
			
			// Délai pour permettre à l'animation de se déclencher
			setTimeout(function(){
				window.location.href = href;
			}, 300);
		});

		// Intercepter les soumissions de formulaires
		$(document).on('submit', 'form', function(e){
			var $form = $(this);
			var action = $form.attr('action') || '';
			
			// Ignorer les formulaires AJAX ou avec des actions spécifiques
			if ($form.hasClass('no-transition') || action.indexOf('ajax') !== -1) return;
			
			// Activer la transition
			self.showPageTransition();
		});

		// Intercepter les clics sur les boutons de sauvegarde du plugin
		$(document).on('click', '.bi-save-mode, .bi-save-theme', function(){
			self.showPageTransition();
		});
	};

	// Afficher l'overlay de transition
	BetterInterfaceAdmin.prototype.showPageTransition = function(){
		$('.bi-page-transition-overlay').addClass('active');
	};

	// ===== SYSTÈME DE POSITIONNEMENT DES NOTICES =====
	// Pourquoi: organiser les notices WordPress en colonne verticale à droite pour éviter les superpositions
	BetterInterfaceAdmin.prototype.initNoticesPositioning = function(){
		var self = this;
		
		// Créer le container pour les notices s'il n'existe pas
		if ($('.bi-notices-container').length === 0) {
			$('body').append('<div class="bi-notices-container"></div>');
		}

		// Fonction pour déplacer une notice dans le container
		function moveNoticeToContainer($notice) {
			if ($notice.closest('.bi-notices-container').length === 0) {
				$('.bi-notices-container').append($notice);
			}
		}

		// Observer les nouvelles notices qui apparaissent
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				mutation.addedNodes.forEach(function(node) {
					if (node.nodeType === 1) { // Element node
						var $node = $(node);
						
						// Vérifier si c'est une notice ou contient des notices
						if ($node.hasClass('notice') || $node.hasClass('notice-success') || $node.hasClass('notice-error') || $node.hasClass('notice-warning') || $node.hasClass('notice-info')) {
							moveNoticeToContainer($node);
						}
						
						// Chercher des notices dans les enfants
						$node.find('.notice, .notice-success, .notice-error, .notice-warning, .notice-info').each(function() {
							moveNoticeToContainer($(this));
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

		// Déplacer les notices existantes
		$('.notice, .notice-success, .notice-error, .notice-warning, .notice-info').each(function() {
			moveNoticeToContainer($(this));
		});
	};

	$(function(){
		(new BetterInterfaceAdmin()).init();
	});
})(jQuery); 
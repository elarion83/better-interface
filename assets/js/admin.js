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
		this.bindModeSelection();
		this.bindThemeSelection();
		this.bindSaves();
		this.initAccordionTables();
		this.bindRowBackgroundSelect();
		this.bindRowCheckboxSync();
		this.initializeSelectedRowsState();
		this.initPageTransition();
	};

	// Pourquoi: permettre de choisir un mode de design
	BetterInterfaceAdmin.prototype.bindModeSelection = function(){
		var self = this;
		$(document).on('click', '.bi-mode-card', function(){
			var mode = $(this).data('mode');
			self.selectedMode = mode;
			$('.bi-mode-card').removeClass('active');
			$(this).addClass('active');
			$('.bi-save-mode').prop('disabled', false);
		});
	};

	// Pourquoi: permettre de choisir un thème couleur (mode moderne uniquement)
	BetterInterfaceAdmin.prototype.bindThemeSelection = function(){
		var self = this;
		$(document).on('click', '.bi-theme-card', function(){
			var theme = $(this).data('theme');
			self.selectedTheme = theme;
			$('.bi-theme-card').removeClass('active');
			$(this).addClass('active');
			$('.bi-save-theme').prop('disabled', false);
		});
	};

	BetterInterfaceAdmin.prototype.bindSaves = function(){
		var self = this;
		// Sauvegarde du mode
		$(document).on('click', '.bi-save-mode', function(){
			if(!self.selectedMode) return;
			$.post(self.ajaxUrl, {
				action: 'bi_save_mode',
				nonce: self.nonce,
				mode: self.selectedMode
			}).always(function(){
				window.location.reload();
			});
		});

		// Sauvegarde du thème
		$(document).on('click', '.bi-save-theme', function(){
			if(!self.selectedTheme) return;
			$.post(self.ajaxUrl, {
				action: 'bi_save_color_theme',
				nonce: self.nonce,
				theme: self.selectedTheme
			}).always(function(){
				window.location.reload();
			});
		});
	};

	// ===== Accordéon Actions & Filtres =====
	BetterInterfaceAdmin.prototype.initAccordionTables = function(){
		var self = this;
		$('.tablenav.top').each(function(){
			var $nav = $(this);
			if ($nav.data('biAccordionInit')) return;
			$nav.data('biAccordionInit', true);

			self.groupTableActions($nav);
			$nav.addClass('bi-accordion-closed');

			$nav.on('click', function(e){
				var $target = $(e.target);
				if (self.isInteractive($target)) return; // ne pas toggle si clic sur élément interactif
				self.toggleAccordion($nav);
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

	$(function(){
		(new BetterInterfaceAdmin()).init();
	});
})(jQuery); 
(function($){
	// ToggleSelector: gère uniquement le toggle de l'affichage transformé et la sélection des thèmes
	function ToggleSelector(){
		this.isTransformed = (window.bi_ajax && bi_ajax.current_mode === 'modern') || false;
		this.currentColorTheme = (window.bi_ajax && bi_ajax.current_color_theme) || 'ocean';
		this.availableColorThemes = (window.bi_ajax && bi_ajax.available_color_themes) || {};
		this.ajaxUrl = (window.bi_ajax && bi_ajax.ajax_url) || ajaxurl;
		this.nonce = (window.bi_ajax && bi_ajax.nonce) || '';

		this.selectedTransformed = null;
		this.selectedTheme = null;
	}

	ToggleSelector.prototype.init = function(){
		this.bindToggleSelection();
		this.bindThemeSelection();
		this.bindSaves();
		this.initializePreview();
	};

	// Pourquoi: permettre d'activer/désactiver l'affichage transformé
	ToggleSelector.prototype.bindToggleSelection = function(){
		var self = this;
		
		// Fonction pour mettre à jour l'affichage
		function updateDisplay(isTransformed) {
			var $card = $('.bi-toggle-card');
			var $title = $('.bi-toggle-text h3');
			var $description = $('.bi-toggle-description');
			var $preview = $('.bi-toggle-preview');
			var $toggle = $('#bi-transformed-toggle');
			
			// Mettre à jour le checkbox
			$toggle.prop('checked', isTransformed);
			
			if (isTransformed) {
				$card.addClass('active');
				$title.text('Activé');
				$description.text('Interface moderne avec des couleurs vives et des animations fluides.');
				// Aperçu moderne avec des couleurs vives
				$preview.addClass('modern-preview');
			} else {
				$card.removeClass('active');
				$title.text('Désactivé');
				$description.text('Interface classique WordPress avec des améliorations subtiles.');
				// Aperçu classique avec des couleurs neutres
				$preview.removeClass('modern-preview');
			}
			
			$('.bi-save-toggle').prop('disabled', false);
		}
		
		// Clic sur la carte entière
		$(document).on('click', '.bi-toggle-card', function(e){
			// Éviter le double déclenchement si on clique directement sur le switch
			if ($(e.target).closest('.bi-switch').length > 0) return;
			
			var $toggle = $('#bi-transformed-toggle');
			var newState = !$toggle.is(':checked');
			self.selectedTransformed = newState;
			updateDisplay(newState);
		});
		
		// Changement direct du switch
		$(document).on('change', '#bi-transformed-toggle', function(){
			var isTransformed = $(this).is(':checked');
			self.selectedTransformed = isTransformed;
			updateDisplay(isTransformed);
		});
	};

	// Pourquoi: permettre de choisir un thème couleur (affichage transformé uniquement)
	ToggleSelector.prototype.bindThemeSelection = function(){
		var self = this;
		$(document).on('click', '.bi-theme-card', function(){
			var theme = $(this).data('theme');
			self.selectedTheme = theme;
			$('.bi-theme-card').removeClass('active');
			$(this).addClass('active');
			$('.bi-save-theme').prop('disabled', false);
		});
	};

	ToggleSelector.prototype.bindSaves = function(){
		var self = this;
		// Sauvegarde du toggle
		$(document).on('click', '.bi-save-toggle', function(){
			if(self.selectedTransformed === null) return;
			
			var mode = self.selectedTransformed ? 'modern' : 'default';
			$.post(self.ajaxUrl, {
				action: 'bi_save_mode',
				nonce: self.nonce,
				mode: mode
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

	// Initialiser l'aperçu selon l'état actuel
	ToggleSelector.prototype.initializePreview = function(){
		var $preview = $('.bi-toggle-preview');
		if (this.isTransformed) {
			$preview.addClass('modern-preview');
		} else {
			$preview.removeClass('modern-preview');
		}
	};

	$(function(){
		(new ToggleSelector()).init();
	});
})(jQuery);

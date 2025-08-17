(function($){
	// ModeSelector: gère uniquement la sélection des modes et thèmes
	function ModeSelector(){
		this.currentMode = (window.bi_ajax && bi_ajax.current_mode) || 'default';
		this.availableModes = (window.bi_ajax && bi_ajax.available_modes) || {};
		this.currentColorTheme = (window.bi_ajax && bi_ajax.current_color_theme) || 'ocean';
		this.availableColorThemes = (window.bi_ajax && bi_ajax.available_color_themes) || {};
		this.ajaxUrl = (window.bi_ajax && bi_ajax.ajax_url) || ajaxurl;
		this.nonce = (window.bi_ajax && bi_ajax.nonce) || '';

		this.selectedMode = null;
		this.selectedTheme = null;
	}

	ModeSelector.prototype.init = function(){
		this.bindModeSelection();
		this.bindThemeSelection();
		this.bindSaves();
	};

	// Pourquoi: permettre de choisir un mode de design
	ModeSelector.prototype.bindModeSelection = function(){
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
	ModeSelector.prototype.bindThemeSelection = function(){
		var self = this;
		$(document).on('click', '.bi-theme-card', function(){
			var theme = $(this).data('theme');
			self.selectedTheme = theme;
			$('.bi-theme-card').removeClass('active');
			$(this).addClass('active');
			$('.bi-save-theme').prop('disabled', false);
		});
	};

	ModeSelector.prototype.bindSaves = function(){
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

	$(function(){
		(new ModeSelector()).init();
	});
})(jQuery);

/**
 * SearchModal: Gère la modale de recherche avec suggestions
 * Extrait de createFloatingActionBar pour améliorer la lisibilité
 */
(function($) {
	window.SearchModal = {
		/**
		 * Crée la modale de recherche et le bouton associé
		 * @param {Object} self - Référence à l'instance BetterInterfaceAdmin
		 * @returns {Object} - Objet contenant $searchModal et $searchButton
		 */
		create: function(self) {
			var $searchModal = null;
			var $searchButton = null;
			var $originalSearchBox = $('.subsubsub + #posts-filter .search-box, .subsubsub + #comments-form .search-box, #wpcf7-contact-form-list-table .search-box');
			
			if ($originalSearchBox.length > 0) {
				// Créer le bouton "Rechercher" dans la barre flottante
				$searchButton = $('<button type="button" class="ngWPAdminUI-search-button" title="Rechercher"><span class="material-icons">search</span></button>');
				
				// Créer la modale de recherche
				$searchModal = $('<div class="ngWPAdminUI-search-modal"><div class="ngWPAdminUI-search-modal-content"><div class="ngWPAdminUI-search-modal-header"><h3><span class="material-icons">search</span> Rechercher</h3><button type="button" class="ngWPAdminUI-search-modal-close"><span class="dashicons dashicons-no-alt"></span></button></div><div class="ngWPAdminUI-search-modal-body"></div></div></div>');
				
				// Cloner le contenu de la search-box dans la modale
				var $searchBoxClone = $originalSearchBox.clone();
				$searchModal.find('.ngWPAdminUI-search-modal-body').append($searchBoxClone);
				
				// Détecter le type de posts actuel
				var currentPostType = self.detectCurrentPostType();
				
				// Créer le container pour les suggestions
				var $suggestionsContainer = $('<div class="ngWPAdminUI-search-suggestions"></div>');
				$searchModal.find('.ngWPAdminUI-search-modal-body').append($suggestionsContainer);
				
				// Gérer la soumission de la recherche dans la modale
				function performSearch() {
					var searchQuery = $searchModal.find('input[type="search"], input[type="text"]').val().trim();
					
					if (searchQuery) {
						// Construire la nouvelle URL avec le paramètre de recherche
						var currentUrl = window.location.href;
						var newUrl;
						
						// Supprimer le paramètre paged s'il existe (retour à la première page)
						currentUrl = currentUrl.replace(/[?&]paged=\d+/, '');
						
						// Vérifier si le paramètre s existe déjà avec une regex plus précise
						if (currentUrl.match(/[?&]s=/)) {
							// Remplacer le paramètre s existant
							newUrl = currentUrl.replace(/[?&]s=[^&]*/, function(match) {
								return match.charAt(0) === '?' ? '?s=' + encodeURIComponent(searchQuery) : '&s=' + encodeURIComponent(searchQuery);
							});
						} else {
							// Ajouter le paramètre s
							var separator = currentUrl.includes('?') ? '&' : '?';
							newUrl = currentUrl + separator + 's=' + encodeURIComponent(searchQuery);
						}
						
						console.log(newUrl)
						// Rediriger vers la nouvelle URL
						window.location.href = newUrl;
					}
				}
				
				// Gérer la touche Entrée sur l'input de recherche
				$searchModal.find('input[type="search"], input[type="text"]').on('keypress', function(e){
					if (e.which === 13) { // Touche Entrée
						e.preventDefault();
						performSearch();
					}
				});
				
				// Gérer les suggestions en temps réel
				var searchTimeout;
				$searchModal.find('input[type="search"], input[type="text"]').on('input', function(){
					var query = $(this).val().trim();
					
					// Effacer le timeout précédent
					clearTimeout(searchTimeout);
					
					// Masquer les suggestions si la requête est trop courte
					if (query.length < 2) {
						$suggestionsContainer.empty().hide();
						return;
					}
					
					// Délai pour éviter trop de requêtes
					searchTimeout = setTimeout(function(){
						self.fetchSearchSuggestions(query, currentPostType, $suggestionsContainer);
					}, 300);
				});
				
				// Gérer le clic sur le bouton de recherche
				$searchModal.find('input[type="submit"], button[type="submit"]').on('click', function(e){
					e.preventDefault();
					performSearch();
				});
				
				// Masquer la search-box originale
				$originalSearchBox.hide();
				
				// Configurer les gestionnaires d'événements
				this.setupEventHandlers($searchButton, $searchModal);
			}
			
			return {
				$searchModal: $searchModal,
				$searchButton: $searchButton
			};
		},
		
		/**
		 * Configure les gestionnaires d'événements pour la modale
		 * @param {jQuery} $searchButton - Bouton de recherche
		 * @param {jQuery} $searchModal - Modale de recherche
		 */
		setupEventHandlers: function($searchButton, $searchModal) {
			if (!$searchButton || !$searchModal) return;
			
			// Gérer l'ouverture/fermeture de la modale de recherche
			$searchButton.on('click', function(e){
				e.preventDefault();
				$searchModal.addClass('ngWPAdminUI-search-modal-open');
				$searchButton.addClass('active');
				
				// Focus sur l'input de recherche
				setTimeout(function(){
					$searchModal.find('input[type="search"], input[type="text"]').focus();
				}, 300);
			});
			
			// Fermer la modale avec le bouton close
			$searchModal.find('.ngWPAdminUI-search-modal-close').on('click', function(e){
				e.preventDefault();
				this.close($searchModal, $searchButton);
			}.bind(this));
			
			// Fermer la modale en cliquant en dehors
			$searchModal.on('click', function(e){
				if (e.target === this) {
					this.close($searchModal, $searchButton);
				}
			}.bind(this));
			
			// Fermer la modale avec la touche Escape
			$(document).on('keydown', function(e){
				if (e.key === 'Escape') {
					// Fermer la modale de recherche si elle est ouverte
					if ($searchModal && $searchModal.hasClass('ngWPAdminUI-search-modal-open')) {
						this.close($searchModal, $searchButton);
					}
				}
			}.bind(this));
		},
		
		/**
		 * Ferme la modale de recherche
		 * @param {jQuery} $searchModal - Modale de recherche
		 * @param {jQuery} $searchButton - Bouton de recherche
		 */
		close: function($searchModal, $searchButton) {
			$searchModal.removeClass('ngWPAdminUI-search-modal-open');
			$searchButton.removeClass('active');
		}
	};
})(jQuery);


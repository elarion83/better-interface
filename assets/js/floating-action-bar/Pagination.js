/**
 * Pagination: Gère la pagination moderne
 * Extrait de createFloatingActionBar pour améliorer la lisibilité
 */
(function($) {
	window.Pagination = {
		/**
		 * Crée les éléments de pagination moderne
		 * @param {jQuery} $paginationContainer - Conteneur pour la pagination
		 * @returns {jQuery} - Élément jQuery de la pagination
		 */
		create: function($paginationContainer) {
			// Créer la pagination moderne
			var currentPage = 1;
			var $currentPageInput = $('#current-page-selector');
			if ($currentPageInput.length > 0) {
				currentPage = parseInt($currentPageInput.val()) || 1;
			}
			
			// Récupérer le nombre total de pages depuis l'URL ou les éléments existants
			var totalPages = 1;
			var $pagination = $('.tablenav-pages, .wp-pagenavi, .pagination').first();
			if ($pagination.length > 0) {
				// Essayer de trouver le nombre total de pages dans les liens existants
				var maxPage = 0;
				$pagination.find('a').each(function(){
					var href = $(this).attr('href');
					if (href) {
						var match = href.match(/[?&]paged=(\d+)/);
						if (match) {
							var pageNum = parseInt(match[1]);
							if (pageNum > maxPage) maxPage = pageNum;
						}
					}
				});
				
				// Logique corrigée : si on trouve des liens, le totalPages = maxPage + 1
				// car maxPage représente la dernière page accessible, pas le nombre total
				if (maxPage > 0) {
					totalPages = maxPage + 1;
				}
				
				// Vérification alternative : chercher dans le texte de pagination existant
				var paginationText = $pagination.text();
				var totalMatch = paginationText.match(/(\d+)\s*\/\s*(\d+)/);
				if (totalMatch && totalMatch[2]) {
					totalPages = parseInt(totalMatch[2]);
				}
			}
			
			// Créer les éléments de pagination
			// Afficher la pagination si il y a plus d'une page OU si on est sur une page > 1
			var pageNumberClass = (totalPages > 1 || currentPage > 1) ? '' : 'ngWPAdminUI-pagination-hide';
			var $paginationElements = $('<div class="ngWPAdminUI-modern-pagination '+pageNumberClass+'"></div>');
			
			// Fonction pour changer de page
			function changePage(page) {
				var currentUrl = window.location.href;
				var newUrl;
				
				if (currentUrl.includes('paged=')) {
					// Remplacer le paramètre paged existant
					newUrl = currentUrl.replace(/[?&]paged=\d+/, function(match) {
						return match.charAt(0) === '?' ? '?paged=' + page : '&paged=' + page;
					});
				} else {
					// Ajouter le paramètre paged
					var separator = currentUrl.includes('?') ? '&' : '?';
					newUrl = currentUrl + separator + 'paged=' + page;
				}
				
				window.location.href = newUrl;
			}
			
			// Bouton première page
			if (currentPage > 1) {
				var $firstPageBtn = $('<button type="button" class="ngWPAdminUI-pagination-btn ngWPAdminUI-pagination-first" title="Première page"><span class="dashicons dashicons-controls-skipback"></span></button>');
				$firstPageBtn.on('click', function(){
					changePage(1);
				});
				$paginationElements.append($firstPageBtn);
			}
			
			// Bouton page précédente
			if (currentPage > 1) {
				var $prevPageBtn = $('<button type="button" class="ngWPAdminUI-pagination-btn ngWPAdminUI-pagination-prev" title="Page précédente"><span class="dashicons dashicons-controls-back"></span></button>');
				$prevPageBtn.on('click', function(){
					changePage(currentPage - 1);
				});
				$paginationElements.append($prevPageBtn);
			}
			
			// Champ de saisie de la page actuelle
			var $pageInput = $('<input type="number" class="ngWPAdminUI-pagination-input" value="' + currentPage + '" min="1" max="' + totalPages + '" title="Page actuelle" />');
			$pageInput.on('change', function(){
				var newPage = parseInt($(this).val());
				if (newPage >= 1 && newPage <= totalPages) {
					changePage(newPage);
				} else {
					$(this).val(currentPage); // Remettre la valeur actuelle si invalide
				}
			});
			$pageInput.on('keypress', function(e){
				if (e.which === 13) { // Enter
					$(this).trigger('change');
				}
			});
			$paginationElements.append($pageInput);
			
			// Séparateur "sur"
			var $separator = $('<span class="ngWPAdminUI-pagination-separator">/</span>');
			$paginationElements.append($separator);
			
			// Nombre total de pages
			var $totalPages = $('<span class="ngWPAdminUI-pagination-total">' + totalPages + '</span>');
			$paginationElements.append($totalPages);
			
			// Bouton page suivante
			if (currentPage < totalPages) {
				var $nextPageBtn = $('<button type="button" class="ngWPAdminUI-pagination-btn ngWPAdminUI-pagination-next" title="Page suivante"><span class="dashicons dashicons-controls-forward"></span></button>');
				$nextPageBtn.on('click', function(){
					changePage(currentPage + 1);
				});
				$paginationElements.append($nextPageBtn);
			}
			
			// Bouton dernière page
			if (currentPage < totalPages) {
				var $lastPageBtn = $('<button type="button" class="ngWPAdminUI-pagination-btn ngWPAdminUI-pagination-last" title="Dernière page"><span class="dashicons dashicons-controls-skipforward"></span></button>');
				$lastPageBtn.on('click', function(){
					changePage(totalPages);
				});
				$paginationElements.append($lastPageBtn);
			}
			
			$paginationContainer.append($paginationElements);
			
			return $paginationElements;
		}
	};
})(jQuery);


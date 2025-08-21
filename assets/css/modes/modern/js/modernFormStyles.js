/**
 * Better Interface - Styles modernes pour les formulaires
 * Applique les classes modernes aux champs de formulaire
 */

(function($) {
    'use strict';
    
    // Configuration des sélecteurs pour les formulaires
    var formStylesConfig = {
        // Champs à styler automatiquement
        inputs: [
            'input[type="text"]',
            'input[type="email"]',
            'input[type="password"]',
            'input[type="url"]',
            'input[type="number"]',
            'textarea',
            'select'
        ],
        
        // Éléments à exclure
        exclude: [
            // Éditeur WordPress
            '#wp-content-editor-tools input',
            '#wp-content-editor-tools textarea',
            '#wp-content-editor-tools select',
            
            // Éditeur de blocs
            '.interface-interface-skeleton__editor input',
            '.interface-interface-skeleton__editor textarea',
            '.interface-interface-skeleton__editor select',
            
            // Médias
            '.media-frame-content input',
            '.media-frame-content textarea',
            '.media-frame-content select',
            
            // TinyMCE
            '.mce-container input',
            '.mce-container textarea',
            '.mce-container select',
            
            // Composants WordPress
            '.components-popover input',
            '.components-popover textarea',
            '.components-popover select',
            
            // Éléments spécifiques
            '.column-title input',
            '.row-actions input',
            '.handle-actions input',
            '#screen-meta-links input',
            '#minor-publishing input',
            '.notice-dismiss',
            
            // Nos éléments personnalisés
            '.ngBetterInterface-floating-actions input',
            '.ngBetterInterface-floating-filters input'
        ]
    };
    
    /**
     * Applique les styles modernes aux champs de formulaire
     */
    function applyModernFormStyles() {
        // Appliquer aux champs
        formStylesConfig.inputs.forEach(function(selector) {
            $(selector).each(function() {
                var $element = $(this);
                
                // Vérifier si l'élément doit être exclu
                var shouldExclude = false;
                formStylesConfig.exclude.forEach(function(excludeSelector) {
                    if ($element.is(excludeSelector) || $element.closest(excludeSelector).length > 0) {
                        shouldExclude = true;
                        return false; // break
                    }
                });
                
                // Appliquer la classe si pas exclu et pas déjà appliquée
                if (!shouldExclude && !$element.hasClass('ngBetterInterface-modern-input')) {
                    $element.addClass('ngBetterInterface-modern-input');
                }
            });
        });
    }
    
    /**
     * Initialise l'application des styles de formulaire
     */
    function initModernFormStyles() {
        // Appliquer immédiatement
        applyModernFormStyles();
        
        // Observer les changements DOM
        if (window.MutationObserver) {
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        setTimeout(applyModernFormStyles, 100);
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        
        // Réappliquer sur les événements AJAX
        $(document).ajaxComplete(function() {
            setTimeout(applyModernFormStyles, 100);
        });
    }
    
    // Initialiser quand le DOM est prêt
    $(document).ready(function() {
        initModernFormStyles();
    });
    
})(jQuery);

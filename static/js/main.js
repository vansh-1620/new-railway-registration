document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // Flash message close button
    const flashCloseButtons = document.querySelectorAll('.flash-close');
    
    flashCloseButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.parentElement.remove();
        });
    });
    
    // Auto hide flash messages after 5 seconds
    setTimeout(function() {
        const flashMessages = document.querySelectorAll('.flash-message');
        
        flashMessages.forEach(message => {
            message.style.opacity = '0';
            setTimeout(() => {
                message.remove();
            }, 500);
        });
    }, 5000);
    
    // Search tab functionality
    const searchTabs = document.querySelectorAll('.search-tab');
    const searchForms = document.querySelectorAll('.search-form');
    
    if (searchTabs.length > 0) {
        searchTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                searchTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show the corresponding form
                const targetForm = this.getAttribute('data-target');
                
                searchForms.forEach(form => {
                    if (form.id === targetForm) {
                        form.style.display = 'grid';
                    } else {
                        form.style.display = 'none';
                    }
                });
            });
        });
    }
    
    // Form validation
    const trainSearchForm = document.getElementById('train-search-form');
    
    if (trainSearchForm) {
        trainSearchForm.addEventListener('submit', function(e) {
            const fromStation = document.getElementById('from-station').value;
            const toStation = document.getElementById('to-station').value;
            const date = document.getElementById('travel-date').value;
            
            if (!fromStation || !toStation || !date) {
                e.preventDefault();
                showFlashMessage('Please fill in all required fields', 'error');
            }
            
            if (fromStation === toStation) {
                e.preventDefault();
                showFlashMessage('From and To stations cannot be the same', 'error');
            }
        });
    }
    
    // PNR form validation
    const pnrForm = document.getElementById('pnr-form');
    
    if (pnrForm) {
        pnrForm.addEventListener('submit', function(e) {
            const pnrNumber = document.getElementById('pnr-number').value;
            
            if (!pnrNumber || pnrNumber.length !== 10 || !/^\d+$/.test(pnrNumber)) {
                e.preventDefault();
                showFlashMessage('Please enter a valid 10-digit PNR number', 'error');
            }
        });
    }
    
    // Seat availability form validation
    const availabilityForm = document.getElementById('availability-form');
    
    if (availabilityForm) {
        availabilityForm.addEventListener('submit', function(e) {
            const trainNumber = document.getElementById('train-number').value;
            const fromStation = document.getElementById('from-station').value;
            const toStation = document.getElementById('to-station').value;
            const date = document.getElementById('travel-date').value;
            const travelClass = document.getElementById('travel-class').value;
            
            if (!trainNumber || !fromStation || !toStation || !date || !travelClass) {
                e.preventDefault();
                showFlashMessage('Please fill in all required fields', 'error');
            }
            
            if (fromStation === toStation) {
                e.preventDefault();
                showFlashMessage('From and To stations cannot be the same', 'error');
            }
        });
    }
    
    // Calendar date picker for date fields
    const dateInputs = document.querySelectorAll('input[type="date"]');
    
    dateInputs.forEach(input => {
        // Set min date to today
        const today = new Date().toISOString().split('T')[0];
        input.setAttribute('min', today);
        
        // Default to today if no date is set
        if (!input.value) {
            input.value = today;
        }
    });
    
    // Helper function to show flash messages
    function showFlashMessage(message, type = 'info') {
        const flashContainer = document.querySelector('.flash-container') || createFlashContainer();
        
        const messageElement = document.createElement('div');
        messageElement.classList.add('flash-message');
        
        if (type) {
            messageElement.classList.add(type);
        }
        
        messageElement.innerHTML = `
            ${message}
            <button class="flash-close">&times;</button>
        `;
        
        flashContainer.appendChild(messageElement);
        
        const closeButton = messageElement.querySelector('.flash-close');
        closeButton.addEventListener('click', function() {
            messageElement.remove();
        });
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            messageElement.style.opacity = '0';
            setTimeout(() => {
                messageElement.remove();
            }, 500);
        }, 5000);
    }
    
    function createFlashContainer() {
        const container = document.createElement('div');
        container.classList.add('flash-container');
        document.body.appendChild(container);
        return container;
    }
    
    // Station autocomplete functionality
    const stationInputs = document.querySelectorAll('.station-input');
    
    stationInputs.forEach(input => {
        input.addEventListener('input', function() {
            const inputValue = this.value.toLowerCase();
            
            if (!inputValue) return;
            
            // Get all stations data
            fetch('/static/data/stations.json')
                .then(response => response.json())
                .then(stations => {
                    // Filter stations based on input
                    const filteredStations = stations.filter(station => 
                        station.name.toLowerCase().includes(inputValue) || 
                        station.code.toLowerCase().includes(inputValue)
                    );
                    
                    // Show autocomplete suggestions
                    showAutocompleteResults(this, filteredStations);
                })
                .catch(error => console.error('Error fetching stations:', error));
        });
    });
    
    function showAutocompleteResults(inputElement, results) {
        // Create or get autocomplete container
        let autocompleteContainer = inputElement.nextElementSibling;
        
        if (!autocompleteContainer || !autocompleteContainer.classList.contains('autocomplete-results')) {
            // Remove any existing autocomplete containers
            const existingContainer = document.querySelector('.autocomplete-results');
            if (existingContainer) {
                existingContainer.remove();
            }
            
            autocompleteContainer = document.createElement('div');
            autocompleteContainer.classList.add('autocomplete-results');
            autocompleteContainer.style.position = 'absolute';
            autocompleteContainer.style.zIndex = '1000';
            autocompleteContainer.style.width = inputElement.offsetWidth + 'px';
            autocompleteContainer.style.maxHeight = '200px';
            autocompleteContainer.style.overflowY = 'auto';
            autocompleteContainer.style.background = 'white';
            autocompleteContainer.style.border = '1px solid #ddd';
            autocompleteContainer.style.borderRadius = '4px';
            autocompleteContainer.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            
            inputElement.parentNode.style.position = 'relative';
            inputElement.parentNode.insertBefore(autocompleteContainer, inputElement.nextSibling);
        }
        
        // Clear previous results
        autocompleteContainer.innerHTML = '';
        
        if (results.length === 0) {
            autocompleteContainer.style.display = 'none';
            return;
        }
        
        // Limit results to 10
        const limitedResults = results.slice(0, 10);
        
        limitedResults.forEach(station => {
            const resultItem = document.createElement('div');
            resultItem.textContent = `${station.name} (${station.code})`;
            resultItem.style.padding = '10px';
            resultItem.style.cursor = 'pointer';
            resultItem.style.borderBottom = '1px solid #eee';
            
            resultItem.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#f5f5f5';
            });
            
            resultItem.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'white';
            });
            
            resultItem.addEventListener('click', function() {
                inputElement.value = station.code;
                autocompleteContainer.style.display = 'none';
            });
            
            autocompleteContainer.appendChild(resultItem);
        });
        
        autocompleteContainer.style.display = 'block';
        
        // Close autocomplete when clicking outside
        document.addEventListener('click', function closeAutocomplete(e) {
            if (e.target !== inputElement && e.target !== autocompleteContainer) {
                autocompleteContainer.style.display = 'none';
                document.removeEventListener('click', closeAutocomplete);
            }
        });
    }
});

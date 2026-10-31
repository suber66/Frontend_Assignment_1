 const sportswearNavLinks = document.querySelectorAll('a[href="sportswear.html"]');

sportswearNavLinks.forEach(link => {
    const listItem = link.closest('li.nav-item');
    if (listItem) {
        listItem.remove();
    }
});
const electronicsCatalog = document.getElementById('electronics-catalog');
    
    if (electronicsCatalog) {
        const techBrands = [
            { 
                id: 'b1', name: 'Apple', category: 'Smartphones & Gadgets', 
                desc: 'Browse Apple devices and select the exact model, storage, and color before requesting a quote.',
                storeLink: 'https://www.apple.com', logo: 'images/logo_apple.png' 
            },
            { 
                id: 'b2', name: 'Dyson', category: 'Home Appliances', 
                desc: 'Browse Dyson home appliances and select the exact item and color before requesting a quote.',
                storeLink: 'https://www.dyson.com', logo: 'images/logo_dyson.png' 
            }
        ];

        function createBrandCard(brand) {
            const col = document.createElement('div');
            col.classList.add('col');

            const card = document.createElement('article');
            card.classList.add('card', 'h-100', 'border', 'rounded-3', 'p-4');

            const imgWrapper = document.createElement('div');
            imgWrapper.classList.add('text-center', 'mb-4', 'mt-2');
            
            const img = document.createElement('img');
            img.src = brand.logo;
            img.alt = brand.name + ' logo';
            img.style.maxHeight = '50px';
            img.style.objectFit = 'contain';
            imgWrapper.appendChild(img);

            const title = document.createElement('h3');
            title.classList.add('h4', 'mb-3');
            title.textContent = brand.name;

            const desc = document.createElement('p');
            desc.classList.add('mb-4');
            desc.style.fontSize = '0.95rem';
            desc.textContent = brand.desc;

            const buttonsContainer = document.createElement('div');
            buttonsContainer.classList.add('mt-auto', 'd-flex', 'gap-2', 'flex-wrap');

            const browseBtn = document.createElement('a');
            browseBtn.href = brand.storeLink;
            browseBtn.target = '_blank';
            browseBtn.classList.add('btn', 'btn-outline-dark', 'btn-sm');
            browseBtn.textContent = 'Browse store';

            const requestBtn = document.createElement('a');
            requestBtn.href = '#electronics-order'; 
            requestBtn.classList.add('btn', 'btn-primary', 'btn-sm');
            requestBtn.textContent = 'Prepare request';

            buttonsContainer.append(browseBtn, requestBtn);
            
            card.append(imgWrapper, title, desc, buttonsContainer);
            col.append(card);
            
            return col;
        }

        function renderCategorySection(titleText, categoryName) {
            const section = document.createElement('section');
            
            const title = document.createElement('h2');
            title.classList.add('h4', 'mb-4');
            title.textContent = titleText;

            const row = document.createElement('div');
            row.classList.add('row', 'row-cols-1', 'g-4');

            const filteredBrands = techBrands.filter(brand => brand.category === categoryName);

            filteredBrands.forEach(brand => {
                const card = createBrandCard(brand);
                row.append(card);
            });

            if (filteredBrands.length > 0) {
                section.append(title, row);
                return section;
            }
            return null;
        }
        
        const smartphonesSection = renderCategorySection('Smartphones & Gadgets', 'Smartphones & Gadgets');
        const appliancesSection = renderCategorySection('Home Appliances', 'Home Appliances');

        const sectionsWrapper = document.createElement('div');
        sectionsWrapper.classList.add('row', 'g-4', 'my-4');

        if (smartphonesSection) {
            const col1 = document.createElement('div');
            col1.classList.add('col-12', 'col-md-6');
            col1.append(smartphonesSection);
            sectionsWrapper.append(col1);
        }

        if (appliancesSection) {
            const col2 = document.createElement('div');
            col2.classList.add('col-12', 'col-md-6');
            col2.append(appliancesSection);
            sectionsWrapper.append(col2);
        }
        
        electronicsCatalog.before(sectionsWrapper);
        electronicsCatalog.remove();
        
        const pageDesc = document.querySelector('.lead');
        if (pageDesc) {
            pageDesc.textContent = 'Browse the brands below and choose a device on the linked store website before requesting a quote.';
        }

        const orderForm = document.getElementById('electronics-order-form');
        
      if (orderForm) {
        const scope = orderForm.parentElement;
        const existing = [...scope.querySelectorAll('button, a.btn')]
            .filter(el => el.textContent.trim().toLowerCase() === 'make order');

        let makeOrderBtn = existing[0];
        const duplicates = existing.slice(1);

        if (!makeOrderBtn) {
            makeOrderBtn = document.createElement('button');
            makeOrderBtn.type = 'button';
            makeOrderBtn.textContent = 'Make order';
            makeOrderBtn.id = 'electronics-make-order-btn';
        }

        makeOrderBtn.classList.remove('w-100', 'd-block', 'btn-lg');
        makeOrderBtn.classList.add('btn', 'btn-primary');

        const instagramBtn = document.createElement('a');
        instagramBtn.href = 'https://www.instagram.com/ayana.buyer/';
        instagramBtn.target = '_blank';
        instagramBtn.rel = 'noopener';
        instagramBtn.classList.add('btn', 'btn-outline-dark');
        instagramBtn.textContent = 'Open Instagram';

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('d-flex', 'flex-row', 'flex-wrap', 'gap-2', 'pt-2');
        buttonContainer.append(makeOrderBtn, instagramBtn); 

        duplicates.forEach(el => el.remove());
        orderForm.className = '';
        orderForm.innerHTML = '';
        orderForm.append(buttonContainer);
        const orderCard = orderForm.closest('.card') || orderForm.parentElement;

        if (orderCard && !orderCard.previousElementSibling?.matches('hr')) {
            const line = document.createElement('hr');
            line.classList.add('mt-4', 'mb-2');  
            orderCard.before(line);
        }


        orderCard.classList.remove('mt-3', 'mt-4', 'mt-5', 'my-3', 'my-4', 'my-5');
        orderCard.classList.add('mt-0');
    }
    }
;
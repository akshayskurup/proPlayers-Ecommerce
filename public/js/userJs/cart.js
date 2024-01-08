document.addEventListener('DOMContentLoaded', function () {
    const productQuantityElements = document.querySelectorAll('.product-quantity');
    const cartSummaryElement = document.querySelector('.cart-summary');

    productQuantityElements.forEach(productQuantityElement => {
        const minusButton = productQuantityElement.querySelector('.minusButton');
        const plusButton = productQuantityElement.querySelector('.plusButton');
        const quantityInput = productQuantityElement.querySelector('.quantityInput');

        const totalPriceElement = document.querySelector(`.total-price[data-product-id="${quantityInput.dataset.productId}"]`);

        minusButton.addEventListener('click', function () {
            var message = document.getElementById('message')

            if (quantityInput.value > 1) {
                quantityInput.value--;
                quantityInput.dispatchEvent(new Event('input'));
                message.innerText = ''
                message.style.display = 'block'

            }
        });

        // plusButton.addEventListener('click', function () {
        //     quantityInput.value++;
        //     // Trigger input event after incrementing
        //     quantityInput.dispatchEvent(new Event('input'));
        // });

        plusButton.addEventListener('click', function () {
            const totalQuantity = parseInt(quantityInput.dataset.totalQuantity, 10);
            const currentQuantity = parseInt(quantityInput.value, 10);
            var message = document.getElementById('message')
            message.innerText = ''
                quantityInput.value++;
                // Trigger input event after incrementing
                quantityInput.dispatchEvent(new Event('input'));
                if (currentQuantity+1 === totalQuantity) {
                
                    message.innerText = 'Product quantity has reached its limit'
                    setTimeout(()=>{
                        message.style.display = 'none'
                    },2000)
    
                }else{
                    message.innerText = ''
                }
            
        });
        

        // Add input event listener to validate input as a number
        quantityInput.addEventListener('input', function () {
            // Remove non-numeric characters
            quantityInput.value = quantityInput.value.replace(/[^0-9]/g, '');
            const totalQuantity = parseInt(quantityInput.dataset.totalQuantity, 10);
            let enteredQuantity = parseInt(quantityInput.value, 10);

            // Check if entered quantity is greater than total quantity
            if (isNaN(enteredQuantity) || enteredQuantity > totalQuantity) {
                // Reset to 1
                enteredQuantity = 1;
            }

            // Update input value
            quantityInput.value = enteredQuantity;

            // Update buttons based on new quantity
            updateButtons(quantityInput, enteredQuantity);


            // Ensure the value is at least 1
            if (quantityInput.value < 1 || isNaN(quantityInput.value)) {
                quantityInput.value = 1;
            }
            

            // Trigger change event after updating the value
            quantityInput.dispatchEvent(new Event('change'));
            const productPrice = parseFloat(totalPriceElement.dataset.price);
            const newTotalPrice = productPrice * quantityInput.value;
            totalPriceElement.textContent = `₹${newTotalPrice}`;
        });

        // Add input event listener for AJAX update
        quantityInput.addEventListener('change', async function () {
            const productId = quantityInput.dataset.productId;
            const newQuantity = parseInt(quantityInput.value, 10);

            // Send an asynchronous request to update the quantity
            try {
                const response = await fetch(`/cart-update-quantity/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ quantity: newQuantity }),
                });

                if (response.ok) {
                    console.log('Quantity updated successfully');
                    updateCartSummary();
                    updateButtons(quantityInput, newQuantity);
                } else {
                    console.error('Failed to update quantity');
                }
            } catch (error) {
                console.error('Error updating quantity:', error);
            }
        });
    });
    function updateCartSummary() {
    // Calculate total price based on the updated quantities of in-stock items
    const totalPriceElements = document.querySelectorAll('.total-price');
    let totalCartPrice = 0;

    totalPriceElements.forEach(totalPriceElement => {
        const productPrice = parseFloat(totalPriceElement.dataset.price);
        const quantityInput = document.querySelector(`.quantityInput[data-product-id="${totalPriceElement.dataset.productId}"]`);
        const totalQuantity = parseInt(quantityInput.dataset.totalQuantity, 10);
        const newTotalPrice = productPrice * parseInt(quantityInput.value, 10);

        // Check if the item is in stock before adding its price to the total
        if (quantityInput.value > 0 && totalQuantity > 0) {
            totalCartPrice += newTotalPrice;
        }
    });

    // Update the cart summary element
    const cartSummaryElement = document.querySelector('.cart-summary');
    if (cartSummaryElement) {
        cartSummaryElement.textContent = `₹${totalCartPrice.toFixed(2)}`;
    }
   
}


    function updateButtons(quantityInput, newQuantity) {
        const minusButton = quantityInput.previousElementSibling;
        const plusButton = quantityInput.nextElementSibling;

        // Disable minus button if new quantity is 1
        minusButton.disabled = newQuantity === 1;

        // Disable plus button if new quantity is equal to total quantity
        const totalQuantity = parseInt(quantityInput.dataset.totalQuantity, 10);
        plusButton.disabled = newQuantity === totalQuantity;

     
    }
});




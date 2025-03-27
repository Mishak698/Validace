document.addEventListener('DOMContentLoaded', function() {
  fetch('/countries')
    .then(response => response.json())
    .then(countries => {
      const select = document.getElementById('country');
      countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.id;
        option.textContent = country.name;
        select.appendChild(option);
      });
    });

  const form = document.getElementById('registerForm');
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    clearErrors();
    
    const isValid = validateForm();
    
    if (isValid) {
      submitForm();
    }
  });
  
  function validateForm() {
    let isValid = true;
    const username = document.getElementById('username').value;
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      showError('usernameError', 'Uživatelské jméno může obsahovat pouze písmena a čísla');
      isValid = false;
    }
    
    const email = document.getElementById('email').value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('emailError', 'Zadejte platný email');
      isValid = false;
    }
    
    const password = document.getElementById('password').value;
    if (!validatePassword(password)) {
      showError('passwordError', 'Heslo musí mít alespoň 8 znaků a splňovat 2 z 3 podmínek: obsahovat malé/velké písmeno, číslo, speciální znak nebo být delší než 16 znaků');
      isValid = false;
    }
    
    const country = document.getElementById('country').value;
    if (!country) {
      showError('countryError', 'Vyberte platnou zemi');
      isValid = false;
    }
    
    return isValid;
  }
  
  function validatePassword(password) {
    if (password.length < 8) return false;
    
    let conditionsMet = 0;
    
    if (/[a-z]/.test(password)) conditionsMet++;
    if (/[A-Z]/.test(password)) conditionsMet++;
    if (/\d/.test(password)) conditionsMet++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) conditionsMet++;
    if (password.length > 16) conditionsMet++;
    
    return conditionsMet >= 2;
  }
  
  function submitForm() {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(data).toString()
    })
    .then(response => response.json())
    .then(data => {
      if (data.errors) {
        data.errors.forEach(error => {
          showError(`${error.param}Error`, error.msg);
        });
      } else {
        form.classList.add('hidden');
        document.getElementById('successMessage').textContent = data.message || 'Registrace úspěšná!';
        document.getElementById('successMessage').classList.remove('hidden');
      }
    })
    .catch(error => {
      console.error('Chyba:', error);
    });
  }
  
  function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.classList.remove('hidden');
  }
  
  function clearErrors() {
    document.querySelectorAll('.error').forEach(element => {
      element.textContent = '';
      element.classList.add('hidden');
    });
  }
});
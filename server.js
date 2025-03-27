const express = require('express');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

const app = express();
const PORT = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const db = {
  users: [
    { username: 'user1', email: 'user1@example.com' },
    { username: 'user2', email: 'user2@example.com' }
  ],
  countries: [
    { id: 1, name: 'Česká republika', active: true },
    { id: 2, name: 'Slovensko', active: true },
    { id: 3, name: 'Německo', active: true },
    { id: 4, name: 'Francie', active: false } 
  ]
};

const validatePassword = (value) => {
  if (value.length < 8) return false;
  
  let conditionsMet = 0;
  if (/[a-z]/.test(value)) conditionsMet++;
  if (/[A-Z]/.test(value)) conditionsMet++;
  if (/\d/.test(value)) conditionsMet++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) conditionsMet++;
  if (value.length > 16) conditionsMet++;
  
  return conditionsMet >= 2;
};

app.get('/countries', (req, res) => {
  const activeCountries = db.countries.filter(country => country.active);
  res.json(activeCountries);
});

app.post('/register', 
  [
    check('username')
      .isAlphanumeric().withMessage('Uživatelské jméno může obsahovat pouze písmena a čísla')
      .custom(value => !db.users.some(user => user.username === value)).withMessage('Uživatelské jméno je již obsazeno'),
    
    check('email')
      .isEmail().withMessage('Zadejte platný email')
      .custom(value => !db.users.some(user => user.email === value)).withMessage('Email je již registrován'),
    
    check('password')
      .custom(validatePassword).withMessage('Heslo musí mít alespoň 8 znaků a splňovat 2 z 3 podmínek: obsahovat malé/velké písmeno, číslo, speciální znak nebo být delší než 16 znaků'),
    
    check('country')
      .isInt().withMessage('Vyberte platnou zemi')
      .custom(value => {
        const countryId = parseInt(value);
        const country = db.countries.find(c => c.id === countryId);
        return country && country.active;
      }).withMessage('Vyberte platnou zemi')
  ],
  (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const newUser = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password, 
      country: req.body.country
    };
    
    db.users.push(newUser);
    
    res.json({ success: true, message: 'Registrace úspěšná!' });
  }
);

app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});
import bcrypt from 'bcryptjs';

const password = '6redareda9@';
const saltRounds = 10;
 
bcrypt.hash(password, saltRounds).then(hash => {
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nUse this hash in the seed.sql file');
}); 
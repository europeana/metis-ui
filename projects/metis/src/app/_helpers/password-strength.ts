/** PasswordStrength
/* export function for evaluating password strength
*/
export function PasswordStrength(p: string): number {
  let strength = 0;
  const _regex = /[$-/:-?{-~!"^_`\[\]]/g;

  const _lowerLetters = /[a-z]+/.test(p);
  const _upperLetters = /[A-Z]+/.test(p);
  const _numbers = /[0-9]+/.test(p);
  const _symbols = _regex.test(p);

  const _flags = [_lowerLetters, _upperLetters, _numbers, _symbols];

  let _passedMatches = 0;
  for (const _flag of _flags) {
    _passedMatches += _flag ? 1 : 0;
  }

  strength += 2 * p.length + (p.length >= 10 ? 1 : 0);
  strength += _passedMatches * 10;

  // penalty (short password)
  strength = p.length <= 6 ? Math.min(strength, 10) : strength;

  // penalty (poor variety of characters)
  strength = _passedMatches === 1 ? Math.min(strength, 10) : strength;
  strength = _passedMatches === 2 ? Math.min(strength, 20) : strength;
  strength = _passedMatches === 3 ? Math.min(strength, 40) : strength;

  return strength;
}

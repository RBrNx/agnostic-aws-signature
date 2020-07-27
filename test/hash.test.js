import { hash } from '../src/helpers';

test('hash returns the SHA256 hash of a value', () => {
  expect(hash('test')).toEqual('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
  expect(hash('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08')).toEqual(
    '7b3d979ca8330a94fa7e9e1b466d8b99e0bcdea1ec90596c0dcc8d7ef6b4300c',
  );
  expect(hash(JSON.stringify({ objectTest: true }))).toEqual('496c7205edbf8c8c4b4c5e5146eadaccbd3c9bbece5882ce74ae36245c849bc0');
});

/**
 * Suite de tests automatisés pour send-email.cjs
 * Tests unitaires sans envoi réel d'emails (mode TEST_EMAIL_MODE=true)
 */

const { handler } = require('./send-email.cjs');

// Active le mode test
process.env.TEST_EMAIL_MODE = 'true';
process.env.SENDGRID_API_KEY = 'SG.test_key_for_unit_tests';
process.env.SENDGRID_FROM_EMAIL = 'test@example.com';

let testsPassed = 0;
let testsFailed = 0;

// Helper pour simuler un événement Netlify
function createMockEvent(method, body) {
  return {
    httpMethod: method,
    body: body ? JSON.stringify(body) : null,
    headers: {}
  };
}

// Helper pour exécuter un test
async function runTest(name, testFn) {
  try {
    await testFn();
    console.log(`✅ PASS: ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Erreur: ${error.message}`);
    testsFailed++;
  }
}

// Helper d'assertion
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Tests
(async () => {
  console.log('\n🧪 DÉBUT DES TESTS - send-email.cjs\n');
  console.log('=' .repeat(60));

  // Test 1: OPTIONS (preflight CORS)
  await runTest('Test 1: Requête OPTIONS (preflight CORS)', async () => {
    const event = createMockEvent('OPTIONS', null);
    const result = await handler(event, {});
    assert(result.statusCode === 200, 'Status code doit être 200');
    assert(result.headers['Access-Control-Allow-Origin'] === '*', 'CORS doit être présent');
  });

  // Test 2: Méthode non autorisée (GET)
  await runTest('Test 2: Méthode GET non autorisée', async () => {
    const event = createMockEvent('GET', null);
    const result = await handler(event, {});
    assert(result.statusCode === 405, 'Status code doit être 405');
    const body = JSON.parse(result.body);
    assert(body.error === 'Method not allowed', 'Erreur attendue');
  });

  // Test 3: Body JSON invalide
  await runTest('Test 3: Body JSON invalide', async () => {
    const event = {
      httpMethod: 'POST',
      body: 'invalid json{',
      headers: {}
    };
    const result = await handler(event, {});
    assert(result.statusCode === 400, 'Status code doit être 400');
    const body = JSON.parse(result.body);
    assert(body.error === 'Invalid JSON body', 'Erreur JSON attendue');
  });

  // Test 4: Champs requis manquants
  await runTest('Test 4: Champs requis manquants', async () => {
    const event = createMockEvent('POST', { to: 'test@example.com' });
    const result = await handler(event, {});
    assert(result.statusCode === 400, 'Status code doit être 400');
    const body = JSON.parse(result.body);
    assert(body.error.includes('Missing required fields'), 'Erreur champs requis attendue');
  });

  // Test 5: Email invalide
  await runTest('Test 5: Format email invalide', async () => {
    const event = createMockEvent('POST', {
      to: 'invalid-email',
      subject: 'Test',
      body: 'Test body'
    });
    const result = await handler(event, {});
    assert(result.statusCode === 400, 'Status code doit être 400');
    const body = JSON.parse(result.body);
    assert(body.error === 'Invalid email address', 'Erreur format email attendue');
  });

  // Test 6: Envoi réussi (mode TEST)
  await runTest('Test 6: Envoi email réussi (SendGrid mode TEST)', async () => {
    const event = createMockEvent('POST', {
      to: 'client@example.com',
      subject: 'Commande validée',
      body: 'Votre commande #12345 a été validée',
      type: 'order_confirmation'
    });
    const result = await handler(event, {});
    assert(result.statusCode === 200, 'Status code doit être 200');
    const body = JSON.parse(result.body);
    assert(body.success === true, 'Success doit être true');
    assert(body.provider === 'sendgrid', 'Provider doit être sendgrid');
  });

  // Résumé
  console.log('=' .repeat(60));
  console.log(`\n📊 RÉSULTATS:`);
  console.log(`   ✅ Tests réussis: ${testsPassed}`);
  console.log(`   ❌ Tests échoués: ${testsFailed}`);
  console.log(`   📈 Total: ${testsPassed + testsFailed}`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ\n');
    process.exit(1);
  }
})();

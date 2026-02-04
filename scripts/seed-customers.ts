/**
 * Skrypt Seedowania Klientów dla Loyalty SaaS
 * ============================================
 * 
 * Ten skrypt generuje przykładowe dane klientów dla systemu lojalnościowego.
 * Tworzy realistyczne polskie dane klientów z punktami, pieczątkami i transakcjami.
 * 
 * Użycie:
 *   npx tsx scripts/seed-customers.ts
 * 
 * Lub z poziomu backend:
 *   cd backend && pnpm seed
 */

// Prosty generator UUID v4 (bez zależności zewnętrznych)
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// ============================================================================
// Konfiguracja
// ============================================================================

const TENANT_ID = 'c06d9088-e3f8-463c-b7ab-7c1013d9d03a';
const LOCATION_IDS = [
    'da472c1b-2c5e-4d72-b288-7f5af6ae938a', // Lokalizacja główna
    '9976c853-4a24-4414-bd67-9edacf8eab72', // Lokalizacja drugorzędna
    '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', // Lokalizacja trzecia
];

// ============================================================================
// Polskie dane do generowania
// ============================================================================

const POLISH_FIRST_NAMES_MALE = [
    'Adam', 'Piotr', 'Jan', 'Krzysztof', 'Andrzej', 'Tomasz', 'Michał', 'Paweł',
    'Marcin', 'Jakub', 'Marek', 'Łukasz', 'Mateusz', 'Grzegorz', 'Wojciech',
    'Kamil', 'Rafał', 'Maciej', 'Dariusz', 'Sebastian', 'Robert', 'Bartosz',
    'Przemysław', 'Artur', 'Dawid', 'Patryk', 'Dominik', 'Konrad', 'Filip',
    'Szymon', 'Hubert', 'Kacper', 'Igor', 'Oskar', 'Wiktor'
];

const POLISH_FIRST_NAMES_FEMALE = [
    'Anna', 'Maria', 'Katarzyna', 'Małgorzata', 'Agnieszka', 'Barbara', 'Ewa',
    'Krystyna', 'Elżbieta', 'Zofia', 'Teresa', 'Magdalena', 'Monika', 'Joanna',
    'Aleksandra', 'Natalia', 'Karolina', 'Justyna', 'Paulina', 'Marta', 'Beata',
    'Dorota', 'Iwona', 'Sylwia', 'Renata', 'Danuta', 'Bożena', 'Jolanta',
    'Weronika', 'Patrycja', 'Dominika', 'Kinga', 'Zuzanna', 'Julia', 'Maja'
];

const POLISH_LAST_NAMES = [
    'Nowak', 'Kowalski', 'Wiśniewski', 'Wójcik', 'Kowalczyk', 'Kamiński',
    'Lewandowski', 'Zieliński', 'Szymański', 'Woźniak', 'Dąbrowski', 'Kozłowski',
    'Jankowski', 'Mazur', 'Kwiatkowski', 'Krawczyk', 'Piotrowski', 'Grabowski',
    'Nowakowski', 'Pawłowski', 'Michalski', 'Adamczyk', 'Dudek', 'Zając',
    'Wieczorek', 'Jabłoński', 'Król', 'Majewski', 'Olszewski', 'Jaworski',
    'Stępień', 'Malinowski', 'Górski', 'Rutkowski', 'Sikora', 'Walczak',
    'Baran', 'Laskowski', 'Kalinowski', 'Szewczyk', 'Ostrowski', 'Tomaszewski',
    'Pietrzak', 'Sikorski', 'Marciniak', 'Bąk', 'Włodarczyk', 'Zawadzki',
    'Sadowski', 'Jakubowski'
];

const POLISH_CITIES = [
    { name: 'Warszawa', postalCodes: ['00-001', '02-515', '03-310', '01-234'] },
    { name: 'Kraków', postalCodes: ['30-001', '31-024', '30-523'] },
    { name: 'Wrocław', postalCodes: ['50-001', '51-162', '53-015'] },
    { name: 'Poznań', postalCodes: ['60-001', '61-129', '60-830'] },
    { name: 'Gdańsk', postalCodes: ['80-001', '80-283', '80-755'] },
    { name: 'Łódź', postalCodes: ['90-001', '91-341', '93-005'] },
    { name: 'Katowice', postalCodes: ['40-001', '40-158', '40-659'] },
    { name: 'Lublin', postalCodes: ['20-001', '20-077', '20-345'] },
];

const STREET_TYPES = ['ul.', 'al.', 'pl.'];
const STREET_NAMES = [
    'Marszałkowska', 'Piłsudskiego', 'Mickiewicza', 'Słowackiego', 'Sienkiewicza',
    'Kościuszki', 'Chopina', 'Wielka', 'Długa', 'Krótka', 'Ogrodowa', 'Parkowa',
    'Lipowa', 'Kwiatowa', 'Słoneczna', 'Leśna', 'Polna', 'Wiejska', 'Nowa',
    'Stara', 'Rynek', 'Główna', 'Wolności', 'Niepodległości', '3 Maja'
];

// ============================================================================
// Funkcje pomocnicze
// ============================================================================

function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone(): string {
    const prefixes = ['500', '501', '502', '503', '504', '505', '506', '507', '508', '509',
        '510', '511', '512', '513', '514', '515', '516', '517', '518', '519',
        '530', '531', '532', '533', '534', '535', '536', '537', '538', '539',
        '600', '601', '602', '603', '604', '605', '606', '607', '608', '609',
        '660', '661', '662', '663', '664', '665', '666', '667', '668', '669',
        '690', '691', '692', '693', '694', '695', '696', '697', '698', '699',
        '780', '781', '782', '783', '784', '785', '786', '787', '788', '789',
        '880', '881', '882', '883', '884', '885', '886', '887', '888', '889'];
    return `+48${randomElement(prefixes)}${randomInt(100, 999)}${randomInt(100, 999)}`;
}

function generateEmail(firstName: string, lastName: string): string {
    const domains = ['gmail.com', 'wp.pl', 'onet.pl', 'o2.pl', 'interia.pl', 'poczta.fm', 'outlook.com'];
    const normalizedFirst = firstName.toLowerCase()
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
        .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
        .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z');
    const normalizedLast = lastName.toLowerCase()
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
        .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
        .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z');

    const formats = [
        `${normalizedFirst}.${normalizedLast}`,
        `${normalizedFirst}${normalizedLast}`,
        `${normalizedFirst}${randomInt(1, 99)}`,
        `${normalizedFirst}.${normalizedLast}${randomInt(1, 99)}`,
    ];

    return `${randomElement(formats)}@${randomElement(domains)}`;
}

function generateBirthDate(): string {
    const year = randomInt(1950, 2005);
    const month = String(randomInt(1, 12)).padStart(2, '0');
    const day = String(randomInt(1, 28)).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function generateAddress(): { street: string; city: string; postalCode: string } {
    const city = randomElement(POLISH_CITIES);
    const streetType = randomElement(STREET_TYPES);
    const streetName = randomElement(STREET_NAMES);
    const streetNumber = randomInt(1, 150);
    const apartment = Math.random() > 0.5 ? `/${randomInt(1, 80)}` : '';

    return {
        street: `${streetType} ${streetName} ${streetNumber}${apartment}`,
        city: city.name,
        postalCode: randomElement(city.postalCodes),
    };
}

function generateCreatedAt(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(randomInt(8, 20), randomInt(0, 59), randomInt(0, 59));
    return date.toISOString();
}

// ============================================================================
// Typy
// ============================================================================

interface Customer {
    id: string;
    tenant_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    birth_date: string | null;
    street: string | null;
    city: string | null;
    postal_code: string | null;
    points_balance: number;
    stamps_balance: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    marketing_consent: boolean;
    email_verified: boolean;
    phone_verified: boolean;
    created_at: string;
    updated_at: string;
}

interface Transaction {
    id: string;
    tenant_id: string;
    customer_id: string;
    location_id: string;
    type: 'earn' | 'redeem' | 'adjustment';
    amount: number; // w groszach
    points_earned: number;
    points_spent: number;
    description: string;
    created_at: string;
}

// ============================================================================
// Generowanie klientów
// ============================================================================

function generateCustomer(daysAgo: number): Customer {
    const isMale = Math.random() > 0.5;
    const firstName = randomElement(isMale ? POLISH_FIRST_NAMES_MALE : POLISH_FIRST_NAMES_FEMALE);
    const lastName = randomElement(POLISH_LAST_NAMES);
    const address = generateAddress();

    // Określ tier na podstawie losowej aktywności
    const activityLevel = Math.random();
    let tier: Customer['tier'];
    let pointsBalance: number;
    let stampsBalance: number;

    if (activityLevel > 0.95) {
        tier = 'platinum';
        pointsBalance = randomInt(5000, 15000);
        stampsBalance = randomInt(8, 10);
    } else if (activityLevel > 0.85) {
        tier = 'gold';
        pointsBalance = randomInt(2000, 5000);
        stampsBalance = randomInt(5, 9);
    } else if (activityLevel > 0.65) {
        tier = 'silver';
        pointsBalance = randomInt(500, 2000);
        stampsBalance = randomInt(3, 7);
    } else {
        tier = 'bronze';
        pointsBalance = randomInt(0, 500);
        stampsBalance = randomInt(0, 4);
    }

    const createdAt = generateCreatedAt(daysAgo);

    return {
        id: generateUUID(),
        tenant_id: TENANT_ID,
        first_name: firstName,
        last_name: lastName,
        email: generateEmail(firstName, lastName),
        phone: generatePhone(),
        birth_date: Math.random() > 0.3 ? generateBirthDate() : null,
        street: Math.random() > 0.2 ? address.street : null,
        city: Math.random() > 0.2 ? address.city : null,
        postal_code: Math.random() > 0.2 ? address.postalCode : null,
        points_balance: pointsBalance,
        stamps_balance: stampsBalance,
        tier: tier,
        marketing_consent: Math.random() > 0.3,
        email_verified: Math.random() > 0.2,
        phone_verified: Math.random() > 0.4,
        created_at: createdAt,
        updated_at: createdAt,
    };
}

function generateTransaction(customerId: string, createdAt: string): Transaction {
    const isEarn = Math.random() > 0.2;
    const amount = randomInt(800, 8500); // 8-85 PLN w groszach

    return {
        id: generateUUID(),
        tenant_id: TENANT_ID,
        customer_id: customerId,
        location_id: randomElement(LOCATION_IDS),
        type: isEarn ? 'earn' : 'redeem',
        amount: amount,
        points_earned: isEarn ? Math.floor(amount / 100) : 0,
        points_spent: isEarn ? 0 : randomInt(50, 200),
        description: isEarn ? 'Zakup w kawiarni' : 'Wymiana punktów na nagrodę',
        created_at: createdAt,
    };
}

// ============================================================================
// Generowanie SQL
// ============================================================================

function escapeString(str: string | null): string {
    if (str === null) return 'NULL';
    return `'${str.replace(/'/g, "''")}'`;
}

function generateCustomerInsertSQL(customers: Customer[]): string {
    const header = `-- ============================================================================
-- Seedowanie Klientów - Wygenerowano automatycznie
-- Tenant: ${TENANT_ID}
-- Data wygenerowania: ${new Date().toISOString()}
-- Liczba klientów: ${customers.length}
-- ============================================================================

BEGIN;

-- Wstawianie klientów
INSERT INTO customers (
  id, tenant_id, first_name, last_name, email, phone, birth_date,
  street, city, postal_code, points_balance, stamps_balance, tier,
  marketing_consent, email_verified, phone_verified, created_at, updated_at
) VALUES`;

    const values = customers.map(c => `
  (
    '${c.id}',
    '${c.tenant_id}',
    ${escapeString(c.first_name)},
    ${escapeString(c.last_name)},
    ${escapeString(c.email)},
    ${escapeString(c.phone)},
    ${c.birth_date ? `'${c.birth_date}'` : 'NULL'},
    ${escapeString(c.street)},
    ${escapeString(c.city)},
    ${escapeString(c.postal_code)},
    ${c.points_balance},
    ${c.stamps_balance},
    '${c.tier}',
    ${c.marketing_consent},
    ${c.email_verified},
    ${c.phone_verified},
    '${c.created_at}',
    '${c.updated_at}'
  )`).join(',');

    return `${header}${values}
ON CONFLICT (id) DO NOTHING;`;
}

function generateTransactionInsertSQL(transactions: Transaction[]): string {
    if (transactions.length === 0) return '';

    const header = `

-- Wstawianie transakcji
INSERT INTO transactions (
  id, tenant_id, customer_id, location_id, type, amount,
  points_earned, points_spent, description, created_at
) VALUES`;

    const values = transactions.map(t => `
  (
    '${t.id}',
    '${t.tenant_id}',
    '${t.customer_id}',
    '${t.location_id}',
    '${t.type}',
    ${t.amount},
    ${t.points_earned},
    ${t.points_spent},
    ${escapeString(t.description)},
    '${t.created_at}'
  )`).join(',');

    return `${header}${values}
ON CONFLICT (id) DO NOTHING;`;
}

// ============================================================================
// Główna funkcja
// ============================================================================

function main() {
    console.log('🌱 Generowanie danych klientów dla Loyalty SaaS...\n');

    const NUM_CUSTOMERS = 50;
    const customers: Customer[] = [];
    const transactions: Transaction[] = [];

    // Generuj klientów z różnymi datami rejestracji
    for (let i = 0; i < NUM_CUSTOMERS; i++) {
        const daysAgo = randomInt(1, 90); // Klienci zarejestrowani w ciągu ostatnich 90 dni
        const customer = generateCustomer(daysAgo);
        customers.push(customer);

        // Generuj 1-10 transakcji dla każdego klienta
        const numTransactions = randomInt(1, 10);
        for (let j = 0; j < numTransactions; j++) {
            const txDaysAgo = randomInt(0, daysAgo);
            const txDate = new Date();
            txDate.setDate(txDate.getDate() - txDaysAgo);
            transactions.push(generateTransaction(customer.id, txDate.toISOString()));
        }
    }

    // Sortuj po dacie utworzenia
    customers.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    transactions.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Generuj SQL
    let sql = generateCustomerInsertSQL(customers);
    sql += generateTransactionInsertSQL(transactions);
    sql += '\n\nCOMMIT;\n';

    // Wypisz SQL (możesz przekierować do pliku)
    console.log(sql);

    console.error('\n✅ Wygenerowano:');
    console.error(`   - ${customers.length} klientów`);
    console.error(`   - ${transactions.length} transakcji`);
    console.error('\n💡 Aby zapisać do pliku, użyj:');
    console.error('   npx tsx scripts/seed-customers.ts > seed-customers.sql');
}

main();

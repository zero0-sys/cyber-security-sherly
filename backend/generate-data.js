import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Generate sample data breach files
const dataBreachDir = path.join(__dirname, '../data-breach');

// Create various document types with sample data
const generateFiles = () => {
    const categories = {
        'leak-databases': ['userdb', 'passwords', 'emails', 'creditcards', 'ssn'],
        'medical-records': ['patients', 'prescriptions', 'lab-results', 'insurance'],
        'financial-docs': ['transactions', 'accounts', 'loans', 'investments'],
        'government-files': ['classified', 'census', 'tax-returns', 'licenses'],
        'corporate-data': ['employees', 'payroll', 'contracts', 'projects']
    };

    console.log('Generating sample data breach files...');

    Object.entries(categories).forEach(([category, types]) => {
        const categoryDir = path.join(dataBreachDir, category);
        if (!fs.existsSync(categoryDir)) {
            fs.mkdirSync(categoryDir, { recursive: true });
        }

        types.forEach(type => {
            // Generate multiple files per type  
            for (let i = 1; i <= 200; i++) {
                const filename = `${type}_${String(i).padStart(4, '0')}.txt`;
                const filepath = path.join(categoryDir, filename);

                // Generate fake data content
                const content = generateContent(type, i);
                fs.writeFileSync(filepath, content);
            }
        });
    });

    console.log('✓ Generated 1000 sample files!');
};

const generateContent = (type, num) => {
    const templates = {
        userdb: () => `USER_ID: ${100000 + num}
USERNAME: user${num}@${['gmail.com', 'yahoo.com', 'hotmail.com'][num % 3]}
PASSWORD_HASH: ${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}
CREATED: ${new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()}
IP_ADDRESS: ${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}
STATUS: ${['ACTIVE', 'SUSPENDED', 'DELETED'][num % 3]}`,

        passwords: () => `ENTRY: PWD-${num}
SERVICE: ${['Facebook', 'Twitter', 'LinkedIn', 'Amazon', 'Netflix'][num % 5]}
EMAIL: leaked${num}@email.com
PASSWORD: ${['password123', 'qwerty', '123456', 'admin', 'letmein'][num % 5]}
LEAKED_DATE: ${new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString()}`,

        emails: () => `MESSAGE_ID: ${num}
FROM: sender${num}@company.com
TO: recipient${num}@example.com
SUBJECT: ${['Urgent', 'Confidential', 'Important'][num % 3]} Document #${num}
DATE: ${new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()}
CONTENT: This is a confidential email containing sensitive information...`,

        creditcards: () => `CARD_NUMBER: ${4000000000000000 + num}
HOLDER: ${['John Doe', 'Jane Smith', 'Bob Johnson'][num % 3]}
EXPIRY: ${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${new Date().getFullYear() + Math.floor(Math.random() * 5)}
CVV: ${String(Math.floor(Math.random() * 900) + 100)}
TYPE: ${['VISA', 'MASTERCARD', 'AMEX'][num % 3]}`,

        ssn: () => `SSN: ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 90) + 10)}-${String(Math.floor(Math.random() * 9000) + 1000)}
NAME: Person #${num}
DOB: ${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}/${1950 + Math.floor(Math.random() * 50)}
ADDRESS: ${num} Main Street, City, ST ${Math.floor(Math.random() * 90000) + 10000}`,

        patients: () => `PATIENT_ID: PT-${num}
NAME: Patient ${num}
DOB: ${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}/${1950 + Math.floor(Math.random() * 70)}
CONDITION: ${['Hypertension', 'Diabetes', 'Asthma', 'Heart Disease'][num % 4]}
LAST_VISIT: ${new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()}`,

        prescriptions: () => `RX_ID: RX-${num}
PATIENT: PT-${num}
MEDICATION: ${['Lisinopril', 'Metformin', 'Albuterol', 'Aspirin'][num % 4]}
DOSAGE: ${[10, 20, 50, 100][num % 4]}mg
PRESCRIBED: ${new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()}`,

        transactions: () => `TRANSACTION_ID: TXN-${num}
ACCOUNT: ${1000000000 + num}
AMOUNT: $${(Math.random() * 10000).toFixed(2)}
TYPE: ${['DEBIT', 'CREDIT', 'TRANSFER'][num % 3]}
DATE: ${new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()}
MERCHANT: ${['Amazon', 'Walmart', 'Target', 'Costco'][num % 4]}`,

        accounts: () => `ACCOUNT_NUMBER: ${1000000000 + num}
HOLDER: Account Holder #${num}
BALANCE: $${(Math.random() * 100000).toFixed(2)}
TYPE: ${['CHECKING', 'SAVINGS', 'INVESTMENT'][num % 3]}
OPENED: ${new Date(Date.now() - Math.random() * 3650 * 24 * 60 * 60 * 1000).toISOString()}`,

        loans: () => `LOAN_ID: LN-${num}
BORROWER: Borrower #${num}
AMOUNT: $${(Math.random() * 500000).toFixed(2)}
RATE: ${(Math.random() * 10).toFixed(2)}%
TERM: ${[15, 20, 30][num % 3]} years`,

        investments: () => `PORTFOLIO_ID: INV-${num}
OWNER: Investor #${num}
TOTAL_VALUE: $${(Math.random() * 1000000).toFixed(2)}
STOCKS: ${Math.floor(Math.random() * 50)}
BONDS: ${Math.floor(Math.random() * 30)}`,

        'lab-results': () => `TEST_ID: LAB-${num}
PATIENT: PT-${num}
TEST_TYPE: ${['Blood Test', 'Urine Test', 'X-Ray', 'MRI'][num % 4]}
RESULT: ${['NORMAL', 'ABNORMAL', 'PENDING'][num % 3]}
DATE: ${new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()}`,

        insurance: () => `POLICY_ID: INS-${num}
HOLDER: Insured #${num}
PROVIDER: ${['Blue Cross', 'Aetna', 'Cigna'][num % 3]}
COVERAGE: $${(Math.random() * 1000000).toFixed(2)}
PREMIUM: $${(Math.random() * 1000).toFixed(2)}/month`,

        employees: () => `EMPLOYEE_ID: EMP-${num}
NAME: Employee #${num}
DEPARTMENT: ${['Engineering', 'Sales', 'HR', 'Finance'][num % 4]}
SALARY: $${(50000 + Math.random() * 150000).toFixed(2)}
SSN: ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 90) + 10)}-${String(Math.floor(Math.random() * 9000) + 1000)}
HIRE_DATE: ${new Date(Date.now() - Math.random() * 1825 * 24 * 60 * 60 * 1000).toISOString()}`,

        payroll: () => `PAYROLL_ID: PAY-${num}
EMPLOYEE: EMP-${num}
GROSS_PAY: $${(Math.random() * 10000).toFixed(2)}
NET_PAY: $${(Math.random() * 7000).toFixed(2)}
PERIOD: ${new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()}`,

        contracts: () => `CONTRACT_ID: CTR-${num}
PARTIES: Company A & Company B
VALUE: $${(Math.random() * 5000000).toFixed(2)}
START_DATE: ${new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()}
DURATION: ${[6, 12, 24, 36][num % 4]} months`,

        projects: () => `PROJECT_ID: PRJ-${num}
NAME: Project ${num}
BUDGET: $${(Math.random() * 1000000).toFixed(2)}
STATUS: ${['ACTIVE', 'DELAYED', 'COMPLETED'][num % 3]}
LEAD: Employee #${num}`,

        classified: () => `CLASSIFICATION: ${['TOP SECRET', 'SECRET', 'CONFIDENTIAL'][num % 3]}
DOCUMENT_ID: DOC-${num}
TITLE: Classified Document #${num}
CLEARANCE_LEVEL: ${num % 5 + 1}
ISSUED: ${new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()}
CONTENT: [REDACTED] - This document contains sensitive national security information.`,

        census: () => `CENSUS_ID: CEN-${num}
HOUSEHOLD: ${num}
MEMBERS: ${Math.floor(Math.random() * 5) + 1}
INCOME: $${(Math.random() * 200000).toFixed(2)}
LOCATION: ${['Urban', 'Suburban', 'Rural'][num % 3]}`,

        'tax-returns': () => `RETURN_ID: TAX-${num}
SSN: ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 90) + 10)}-${String(Math.floor(Math.random() * 9000) + 1000)}
YEAR: ${2020 + (num % 4)}
INCOME: $${(Math.random() * 200000).toFixed(2)}
TAX_OWED: $${(Math.random() * 40000).toFixed(2)}
REFUND: $${(Math.random() * 5000).toFixed(2)}`,

        licenses: () => `LICENSE_ID: LIC-${num}
TYPE: ${['DRIVER', 'BUSINESS', 'PROFESSIONAL'][num % 3]}
HOLDER: License Holder #${num}
NUMBER: ${Math.random().toString(36).substring(2, 12).toUpperCase()}
ISSUED: ${new Date(Date.now() - Math.random() * 1825 * 24 * 60 * 60 * 1000).toISOString()}
EXPIRES: ${new Date(Date.now() + Math.random() * 1825 * 24 * 60 * 60 * 1000).toISOString()}`
    };

    return templates[type] ? templates[type]() : `SAMPLE DATA ${type} #${num}`;
};

// Run the generator
generateFiles();

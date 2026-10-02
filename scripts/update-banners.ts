import { serverDb } from '../server/firebase.js';
import { doc, setDoc } from 'firebase/firestore';

const NEW_BANNERS = [
  {
    bannerId: 'banner-01',
    title: 'Personal Loan – Instant Loans for All Your Personal Needs',
    description: 'Quick digital sanction, zero collateral, and customized repayment tenure with top RBI-registered lenders.',
    buttonText: 'Apply Now',
    destinationUrl: 'https://dukaan.werize.com/loan-saving-agent-unnao-FinCred-personal-loan-3LIBPj40asdAPudzvFhPdU',
    imageUrl: '/banners/banner-personal-loan.jpg',
    isActive: true,
    displayOrder: 1,
    createdAt: '2026-09-14T22:00:00.000Z'
  },
  {
    bannerId: 'banner-02',
    title: 'Navi UPI – Real-Time Payment Security',
    description: 'Ultra-safe UPI payments with Navi Secure 24x7 intelligent fraud defense, zero transaction fee, and instant rewards.',
    buttonText: 'Download Navi App',
    destinationUrl: 'https://r.navi.com/t3HqoB',
    imageUrl: '/banners/banner-navi-upi.jpg',
    isActive: true,
    displayOrder: 2,
    createdAt: '2026-09-14T22:00:00.000Z'
  },
  {
    bannerId: 'banner-03',
    title: 'Personal Loan Scams in India – How to Avoid Them',
    description: 'Stay alert against unauthorized loan apps. FinCred never charges upfront processing fees. Verified safety guide.',
    buttonText: 'Read Safety Guide',
    destinationUrl: '/disclaimer',
    imageUrl: '/banners/banner-scam-safety.jpg',
    isActive: true,
    displayOrder: 3,
    createdAt: '2026-09-14T22:00:00.000Z'
  }
];

async function run() {
  console.log('Updating banners in Firestore...');
  for (const b of NEW_BANNERS) {
    const ref = doc(serverDb, 'banners', b.bannerId);
    await setDoc(ref, b, { merge: true });
    console.log(`Updated banner ${b.bannerId}: ${b.title}`);
  }
  console.log('All banners updated successfully in Firestore!');
  process.exit(0);
}

run().catch(err => {
  console.error('Error updating banners:', err);
  process.exit(1);
});

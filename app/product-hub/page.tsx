'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductHub() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [background, setBackground] = useState('sky');
  const [font, setFont] = useState('playfair');

  const selectProduct = (product: string) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const goToBuilder = () => {
    if (!selectedProduct) return;
    
    localStorage.setItem('selectedProduct', selectedProduct);
    localStorage.setItem('selectedBackground', background);
    localStorage.setItem('selectedFont', font);

    if (selectedProduct === 'card') {
      router.push('/memorial-card-builder');
    } else if (selectedProduct === 'enlargement') {
      router.push('/enlargement-builder');
    } else if (selectedProduct === 'program') {
      router.push('/service-program-builder');
    }
    
    setShowModal(false);
  };

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)'}}>
      <div style={{display:'flex',justifyContent:'space-between',padding:'8px 16px',background:'rgba(255,255,255,0.1)',backdropFilter:'blur(10px)',color:'white'}}>
        <div>9:41</div><div>●●●●● 📶 🔋</div>
      </div>
      <div style={{maxWidth:'450px',margin:'0 auto',background:'white',minHeight:'calc(100vh - 40px)',padding:'20px'}}>
        <div style={{textAlign:'center',marginBottom:'30px'}}>
          <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'32px',color:'#764ba2',marginBottom:'8px'}}>Create Your Memorial</h1>
          <p style={{color:'#718096',fontSize:'14px'}}>Choose products to customize</p>
        </div>
        {/* Products will go here - simplified for now */}
        <div onClick={()=>selectProduct('card')} style={{background:'white',borderRadius:'16px',padding:'20px',boxShadow:'0 4px 6px rgba(0,0,0,0.1)',cursor:'pointer'}}>
          <h3>4"×6" Memorial Card</h3>
          <p>Two-sided postcard with photo and QR</p>
        </div>
      </div>
    </div>
  );
}

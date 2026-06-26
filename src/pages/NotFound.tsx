import { Link } from 'react-router-dom';
import { useSettings } from '@/lib/queries';
import BrandLogo from '@/components/BrandLogo';
import { openWhatsApp } from '@/lib/whatsapp';

const NotFound = () => {
  const { data: settings } = useSettings();
  const wa = settings?.whatsapp_number?.replace(/\D/g, '');

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-6 text-center">
      <Link to="/" className="mb-8">
        <BrandLogo className="h-10 w-auto" />
      </Link>
      <p className="text-7xl font-serif text-[#C9A84C] mb-4">404</p>
      <h1 className="font-serif text-2xl text-[#2C2C2C] mb-2">Page not found</h1>
      <p className="text-sm text-[#9A8F85] mb-8 max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/"
        className="px-8 py-3 rounded-full bg-[#C9A84C] text-white font-semibold text-sm hover:bg-[#B8963E] transition-colors mb-4"
      >
        Back to Home
      </Link>
      {wa && (
        <button
          onClick={() => openWhatsApp(wa, 'Hi Eraya! I got a 404 error and need help.')}
          className="text-sm text-[#C9A84C] underline"
        >
          Need help? Chat with us
        </button>
      )}
    </div>
  );
};

export default NotFound;

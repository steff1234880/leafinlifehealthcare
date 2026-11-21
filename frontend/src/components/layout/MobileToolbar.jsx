import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

export default function MobileToolbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { wishlistCount, setIsLoginOpen } = useStore();

  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate('/account');
    } else {
      setIsLoginOpen(true);
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 z-20 w-full bg-white shadow-[0_0_10px_#1a1a1a26] flex md:hidden justify-center">
      <div className="grid grid-cols-4 w-full p-0">
        {/* Home */}
        <Link
          to="/"
          className="flex flex-col items-center justify-center py-[14px] text-black hover:text-[#2f3e10] border-r border-black/20"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[16px] h-[16px]"
          >
            <path
              d="M24.1081 10.9814V25.1061C24.1081 25.9041 23.4618 26.5504 22.6638 26.5504H19.7754C18.9774 26.5504 18.3311 25.9041 18.3311 25.1061V22.2177C18.3311 20.6218 17.0385 19.3292 15.4426 19.3292H12.5541C10.9582 19.3292 9.66565 20.6218 9.66565 22.2177V25.1061C9.66565 25.9041 9.01935 26.5504 8.2214 26.5504H5.33292C4.53497 26.5504 3.88867 25.9041 3.88867 25.1061V10.9814"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M1 13.5521L12.0809 2.79614C13.175 1.73462 14.825 1.73462 15.919 2.79614L27 13.5521"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[14px] leading-[14px] font-normal mt-[7px] capitalize">
            Home
          </span>
        </Link>

        {/* Shop */}
        <Link
          to="/collections/all"
          className="flex flex-col items-center justify-center py-[14px] text-black hover:text-[#2f3e10] border-r border-black/20"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[16px] h-[16px]"
          >
            <path
              d="M26.9964 14.9982H1L2.04343 8.74467C2.27451 7.35097 3.4805 6.33276 4.89225 6.33276H23.1078C24.5195 6.33276 25.7255 7.35459 25.9566 8.74467L27 14.9982H26.9964Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.44385 2H25.5517"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.44385 14.9982V22.2194C2.44385 23.8153 3.73645 25.1079 5.33233 25.1079H13.9978C15.5937 25.1079 16.8863 23.8153 16.8863 22.2194V14.9982"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M25.5522 14.9982V25.1079"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[14px] leading-[14px] font-normal mt-[7px] capitalize">
            Shop
          </span>
        </Link>

        {/* Wishlist */}
        <Link
          to="/pages/wishlist"
          className="flex flex-col items-center justify-center py-[14px] text-black hover:text-[#2f3e10] border-r border-black/20"
        >
          <div className="relative flex">
            <svg
              width="16"
              height="16"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[16px] h-[16px]"
            >
              <path
                d="M14.0049 7.14229C14.2049 6.89288 16.9785 3.53895 20.5819 4.13951C23.3687 4.60224 25.0053 7.15217 25.5453 8.44846C27.3053 12.6721 23.8485 17.9393 17.0384 23.8629C15.295 25.379 12.5916 25.379 10.8482 23.8629C4.06472 17.959 0.704572 12.7639 2.46129 8.54032C3.0013 7.24403 4.63806 4.5333 7.42481 4.07057C11.0282 3.47001 13.8016 6.89288 14.0017 7.14558L14.0049 7.14229Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-[4px] -right-[8px] bg-black text-white w-[14px] h-[14px] rounded-full flex items-center justify-center text-[9px]">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[14px] leading-[14px] font-normal mt-[7px] capitalize">
            Wishlist
          </span>
        </Link>

        {/* Account / Profile */}
        <button
          type="button"
          onClick={handleProfileClick}
          aria-label={isAuthenticated ? 'My Profile' : 'Log in'}
          className={`flex flex-col items-center justify-center py-[14px] bg-transparent border-0 cursor-pointer ${
            isAuthenticated ? 'text-[#729855] hover:text-[#2f3e10]' : 'text-black hover:text-[#2f3e10]'
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[16px] h-[16px]"
          >
            <path
              d="M14 15.1429C17.6293 15.1429 20.5714 12.2007 20.5714 8.57143C20.5714 4.94213 17.6293 2 14 2C10.3707 2 7.42859 4.94213 7.42859 8.57143C7.42859 12.2007 10.3707 15.1429 14 15.1429Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 26C2 19.9984 5.18545 15.1428 11.8182 15.1428H16.1818C22.8145 15.1428 26 19.9984 26 26"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[14px] leading-[14px] font-normal mt-[7px] capitalize truncate max-w-[65px]">
            {isAuthenticated ? 'Profile' : 'Log in'}
          </span>
        </button>
      </div>
    </div>
  );
}


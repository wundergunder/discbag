import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '../components/layout/RootLayout';
import { Layout } from '../components/layout/Layout';
import { LoginPage } from '../pages/LoginPage';
import { SignUpPage } from '../pages/SignUpPage';
import { DashboardPage } from '../pages/DashboardPage';
import { InventoryPage } from '../pages/InventoryPage';
import { SelectDiscPage } from '../pages/SelectDiscPage';
import { AddDiscPage } from '../pages/AddDiscPage';
import { MarketplacePage } from '../pages/MarketplacePage';
import { CreateListingPage } from '../pages/CreateListingPage';
import { MessagesPage } from '../pages/MessagesPage';
import { ConversationPage } from '../pages/ConversationPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'signup',
        element: <SignUpPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <Layout />,
            children: [
              {
                path: '/',
                element: <DashboardPage />,
              },
              {
                path: 'dashboard',
                element: <DashboardPage />,
              },
              {
                path: 'inventory',
                element: <InventoryPage />,
              },
              {
                path: 'inventory/select',
                element: <SelectDiscPage />,
              },
              {
                path: 'inventory/add/:modelId',
                element: <AddDiscPage />,
              },
              {
                path: 'marketplace',
                element: <MarketplacePage />,
              },
              {
                path: 'marketplace/create',
                element: <CreateListingPage />,
              },
              {
                path: 'messages',
                element: <MessagesPage />,
              },
              {
                path: 'messages/:conversationId',
                element: <ConversationPage />,
              },
              {
                path: 'profile',
                element: <ProfilePage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
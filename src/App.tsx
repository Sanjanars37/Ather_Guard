/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  return (
    <>
      <Dashboard />
      <Toaster theme="dark" position="bottom-center" />
    </>
  );
}

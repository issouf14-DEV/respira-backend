import React from "react";
import Header from "./component/Header";
import Footer from "./component/Footer";
import LeftContainner from "./Layout/LeftContainner";
import Visualization from "./Layout/Visualization/Visualization";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />
      <main className="flex flex-wrap justify-center items-center bg-gray-100 px-10 md:flex-nowrap flex-grow">
        {/* <LeftContainner /> */}
        <LeftContainner />
        <Visualization />




      </main>
      {/* <Footer /> */}
      <Footer />

    </div>
  );
}

export default App;

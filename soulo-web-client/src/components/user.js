import React from "react";
import Card from "./Card";
import { Link } from "react-router-dom";

function User({ firstName, id }) {
  return (
    <Link className="nav-link" to={"/profile/" + id}>
      <Card
        title="House"
        image={require("../assets/test.JPG")}
        caption={firstName}
        subtitle="Live"
      />
    </Link>
  );
}

export default User;
<template>
  <div class="tabs">
    <b-tabs v-model="activeTab" expanded :animated="false">
      <!-- Mint Tab -->
      <b-tab-item label="Register">
        <h2 class="title is-size-4">Register your Evmos Identity</h2>
        <h3 v-if="identity">You're recognized as {{ identity }}!</h3>
        <br />
        <div style="width: 300px; display: inline-block; margin-bottom: 25px">
          <b-field label="Insert new identity">
            <b-input v-model="toRegister"></b-input>
          </b-field>
        </div>
        <br />
        <b-button v-if="!pending" v-on:click="register" type="is-primary"
          >REGISTER NEW IDENTITY</b-button
        >
        <div v-if="pending">
          Pending transaction hash is<br />{{ pending }}..
        </div>
      </b-tab-item>
      <b-tab-item label="Search">
        <div style="width: 300px; display: inline-block; margin-bottom: 25px">
          <b-field label="Search an identity">
            <b-input v-model="toSearch"></b-input>
          </b-field>
        </div>
        <br>
        <b-button v-if="!pending" v-on:click="search" type="is-primary"
          >SEARCH IDENTITY</b-button
        >
        <h3 v-if="found"><hr>Address found: {{ found }}!</h3>
      </b-tab-item>
    </b-tabs>
  </div>
</template>

<script>
import Web3 from "web3";
const ABI = require("../abi.json");
const configs = require("../configs.json");

export default {
  props: ["account"],
  data() {
    return {
      activeTab: 0,
      web3: new Web3(window.ethereum),
      ABI: ABI,
      identity: "",
      toRegister: "",
      pending: "",
      toSearch: "",
      found: ""
    };
  },
  methods: {
    async register() {
      const app = this;
      const contract = new app.web3.eth.Contract(
        app.ABI,
        configs.contract_address
      );
      try {
        const addressOfIdentity = await contract.methods
          .returnIdentityByName(app.toRegister)
          .call();
        console.log("Address of identity is:", addressOfIdentity);
        if (
          addressOfIdentity === "0x0000000000000000000000000000000000000000"
        ) {
          await contract.methods
            .setIdentity(app.toRegister)
            .send({
              from: app.account,
              gasLimit: 100000,
            })
            .on("transactionHash", (pending) => {
              app.pending = pending;
            });
          alert("You successfully registered an identity!");
          const identityOfAddress = await contract.methods
            .returnIdentityByAddress(app.account)
            .call();
          app.identity = identityOfAddress;
          app.pending = "";
          app.toRegister = "";
        } else {
          alert("This name is taken yet!");
        }
      } catch (e) {
        alert(e.message);
      }
    },
    async search() {
      const app = this;
      const contract = new app.web3.eth.Contract(
        app.ABI,
        configs.contract_address
      );
      try {
        const addressOfIdentity = await contract.methods
          .returnIdentityByName(app.toSearch)
          .call();
        console.log("Address of identity is:", addressOfIdentity);
        if (
          addressOfIdentity !== "0x0000000000000000000000000000000000000000"
        ) {
          app.found = addressOfIdentity;
        } else {
          alert("Can't found name!");
        }
      } catch (e) {
        alert(e.message);
      }
    },
  },
  async mounted() {
    const app = this;
    const contract = new app.web3.eth.Contract(
      app.ABI,
      configs.contract_address
    );
    const identityOfAddress = await contract.methods
      .returnIdentityByAddress(app.account)
      .call();
    app.identity = identityOfAddress;
  },
};
</script>
<style>
.label {
  color: #fff !important;
}
</style>
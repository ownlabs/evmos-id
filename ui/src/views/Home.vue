<template>
  <div class="tabs">
    <b-tabs v-model="activeTab" expanded :animated="false">
      <!-- Mint Tab -->
      <b-tab-item label="Register a name">
        <h2 class="title is-size-4">Register your Evmos Identity</h2>
        <h3 v-if="identity">You're recognized as {{ identity }}!</h3>
        <br />
        <div style="width: 300px; display: inline-block; margin-bottom: 25px">
          <b-field label="Insert new identity">
            <b-input v-model="toRegister"></b-input>
          </b-field>
        </div>
        <br />
        <b-button
          v-if="!pending && !isRegistering"
          v-on:click="register"
          type="is-primary"
          >REGISTER NEW IDENTITY</b-button
        >
        <div v-if="isRegistering && !pending">Registering, please wait..</div>
        <div v-if="pending">
          Pending transaction hash is<br />{{ pending }}..
        </div>
      </b-tab-item>
      <b-tab-item label="Your identities">
        <h2 class="title is-size-4">Here you can find your identities</h2>
        <div
          v-if="identities.length > 0"
          style="width: 450px; display: inline-block"
        >
          <div
            v-for="identity in identities"
            v-bind:key="identity.name"
            style="
              text-align: left;
              border: 1px solid #fff;
              border-radius: 10px;
              padding: 15px 20px 20px 20px;
              margin-bottom: 20px;
            "
          >
            {{ identity.name }}<br />
            {{ identity.address.substr(0, 6) }}..{{
              identity.address.substr(-6)
            }}
            <b-button
              type="is-primary is-small"
              v-on:click="openModal(identity)"
              style="float: right; margin-top: -14px"
              >MANAGE</b-button
            >
          </div>
        </div>
        <div v-if="identities.length === 0">
          Nothing to show here, please register an identity first..
        </div>
      </b-tab-item>
      <b-tab-item label="Search and send">
        <div style="width: 300px; display: inline-block; margin-bottom: 25px">
          <b-field label="Search an identity">
            <b-input v-model="toSearch"></b-input>
          </b-field>
        </div>
        <br />
        <b-button v-if="!isSearching" v-on:click="search" type="is-primary"
          >SEARCH IDENTITY</b-button
        >
        <div v-if="isSearching">Searching, please wait..</div>
        <h3 v-if="found">
          <hr />
          Address found: {{ found }}!
          <br />
          <div style="width: 300px; display: inline-block; margin-bottom: 25px">
            <b-field label="Write the amount to send">
              <b-input v-model="toSend"></b-input>
            </b-field>
            <b-button v-on:click="send" v-if="!isSending" type="is-primary"
              >SEND PHOTONS</b-button
            >
          </div>
        </h3>
      </b-tab-item>
    </b-tabs>
    <b-modal
      :active="showEdit"
      has-modal-card
      trap-focus
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-modal
    >
      <div class="modal-card" style="width: 350px">
        <header class="modal-card-head">
          <p class="modal-card-title">Linked address</p>
          <button type="button" class="delete" @click="showEdit = false" />
        </header>
        <section class="modal-card-body" style="color: #000">
          <b-field label="Connect name to this address">
            <b-input
              type="text"
              v-model="connected"
              placeholder="Write down desired address"
              required
            >
            </b-input>
          </b-field>
        </section>
        <footer class="modal-card-foot">
          <b-button
            v-if="!isChanging"
            label="Change address"
            v-on:click="changeLink"
            expanded
            type="is-primary"
          />
          <div v-if="isChanging && !pending" style="color: #000">
            Changing link, please wait..
          </div>
          <div v-if="pending" style="color: #000; font-size: 11px">
            Pending transaction hash is {{ pending.substr(0, 6) }}..{{
              pending.substr(-6)
            }}
          </div>
        </footer>
      </div>
    </b-modal>
  </div>
</template>
<style>
.modal-close {
  display: none !important;
}
.modal .label {
  color: #333 !important;
}
</style>
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
      found: "",
      toSend: 0,
      identities: [],
      isSearching: false,
      isSending: false,
      isRegistering: false,
      isChanging: false,
      showEdit: false,
      connected: "",
      name: "",
    };
  },
  methods: {
    async register() {
      const app = this;
      if (!app.isRegistering) {
        app.isRegistering = true;
        const contract = new app.web3.eth.Contract(
          app.ABI,
          configs.contract_address
        );
        try {
          const addressOfIdentity = await contract.methods
            .returnAddressByName(app.toRegister)
            .call();
          console.log("Address of identity is:", addressOfIdentity);
          if (
            addressOfIdentity === "0x0000000000000000000000000000000000000000"
          ) {
            await contract.methods
              .setIdentity(app.toRegister)
              .send({
                from: app.account,
                gasLimit: 500000,
              })
              .on("transactionHash", (pending) => {
                app.pending = pending;
              });
            alert("You successfully registered an identity!");
            const ownedByAddress =
              (await contract.methods
                .returnOwnedByAddress(app.account)
                .call()) - 1;
            const identityOfAddress = await contract.methods
              .returnNameByAddress(app.account, ownedByAddress)
              .call();
            app.identity = identityOfAddress;
            app.pending = "";
            app.toRegister = "";
            app.isRegistering = false;
            app.fetchIdentities();
          } else {
            alert("This name is taken yet!");
          }
        } catch (e) {
          app.isRegistering = false;
          alert(e.message);
        }
      }
    },
    async search() {
      const app = this;
      if (!app.isSearching) {
        app.isSearching = true;
        const contract = new app.web3.eth.Contract(
          app.ABI,
          configs.contract_address
        );
        try {
          const addressOfIdentity = await contract.methods
            .returnAddressByName(app.toSearch)
            .call();
          console.log("Address of identity is:", addressOfIdentity);
          if (
            addressOfIdentity !== "0x0000000000000000000000000000000000000000"
          ) {
            app.found = addressOfIdentity;
          } else {
            alert("Can't found name!");
          }
          app.isSearching = false;
        } catch (e) {
          app.isSearching = false;
          alert(e.message);
        }
      }
    },
    async send() {
      const app = this;
      if (!app.isSending) {
        app.isSending = true;
        const transaction = {
          from: app.account,
          to: app.found,
          value: app.web3.utils.toWei(app.toSend, "ether"),
          gas: 21000,
        };
        try {
          let sent = await app.web3.eth
            .sendTransaction(transaction)
            .on("transactionHash", (pending) => {
              console.log("Pending transaction hash is: " + pending);
            });
          app.isSending = false;
          alert(
            "You've successfully sent " +
              app.toSend +
              " PHOTONS to " +
              app.found +
              "!"
          );
        } catch (e) {
          alert(e.message);
          app.isSending = false;
        }
      }
    },
    async fetchIdentities() {
      const app = this;
      app.identities = [];
      const contract = new app.web3.eth.Contract(
        app.ABI,
        configs.contract_address
      );
      const ownedByAddress = await contract.methods
        .returnOwnedByAddress(app.account)
        .call();
      for (let i = 0; i < ownedByAddress; i++) {
        const identityOfAddress = await contract.methods
          .returnNameByAddress(app.account, i)
          .call();
        console.log("Checking address of " + identityOfAddress);
        const addressOfIdentity = await await contract.methods
          .returnAddressByName(identityOfAddress)
          .call();
        console.log("Address is " + addressOfIdentity);
        app.identities.push({
          name: identityOfAddress,
          address: addressOfIdentity,
        });
      }
    },
    openModal(identity) {
      const app = this;
      app.connected = identity.address;
      app.name = identity.name;
      app.showEdit = true;
    },
    async changeLink() {
      const app = this;
      if (!app.isChanging) {
        app.isChanging = true;
        const contract = new app.web3.eth.Contract(
          app.ABI,
          configs.contract_address
        );
        try {
          console.log(
            "Changing name " + app.name + " link with " + app.connected
          );
          await contract.methods
            .changeLink(app.name, app.connected)
            .send({
              from: app.account,
              gasLimit: 500000,
            })
            .on("transactionHash", (pending) => {
              app.pending = pending;
            });
          app.isChanging = false;
          app.pending = "";
          app.showEdit = false;
          app.fetchIdentities();
          alert("You successfully changed the link!");
        } catch (e) {
          app.isChanging = false;
          alert(e.message);
        }
      }
    },
  },
  async mounted() {
    const app = this;
    const contract = new app.web3.eth.Contract(
      app.ABI,
      configs.contract_address
    );
    const ownedByAddress =
      (await contract.methods.returnOwnedByAddress(app.account).call()) - 1;
    const identityOfAddress = await contract.methods
      .returnNameByAddress(app.account, ownedByAddress)
      .call();
    app.identity = identityOfAddress;
    app.fetchIdentities();
  },
};
</script>
<style>
.label {
  color: #fff !important;
}
</style>
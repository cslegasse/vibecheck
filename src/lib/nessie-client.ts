

const NESSIE_BASE_URL = "http://api.nessieisreal.com";
const NESSIE_API_KEY = process.env.NESSIE_API_KEY || "";

export interface NessieAccount {
  _id: string;
  type: string;
  nickname: string;
  rewards: number;
  balance: number;
  account_number: string;
  customer_id: string;
}

export interface NessieTransaction {
  _id: string;
  type: "deposit" | "withdrawal" | "transfer";
  transaction_date: string;
  status: string;
  medium: string;
  payer_id?: string;
  payee_id?: string;
  amount: number;
  description: string;
}

export interface NessieTransfer {
  medium: string;
  payee_id: string;
  amount: number;
  transaction_date: string;
  description: string;
}

export interface NessieCustomer {
  _id: string;
  first_name: string;
  last_name: string;
  address: {
    street_number: string;
    street_name: string;
    city: string;
    state: string;
    zip: string;
  };
}

class NessieClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string = NESSIE_API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = NESSIE_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}?key=${this.apiKey}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Nessie API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // ==================== ACCOUNT OPERATIONS ====================

  /**
   * Get all accounts for a customer
   */
  async getCustomerAccounts(customerId: string): Promise<NessieAccount[]> {
    return this.request<NessieAccount[]>(`/customers/${customerId}/accounts`);
  }

  /**
   * Get a specific account by ID
   */
  async getAccount(accountId: string): Promise<NessieAccount> {
    return this.request<NessieAccount>(`/accounts/${accountId}`);
  }

  /**
   * Create a new account for a customer
   */
  async createAccount(
    customerId: string,
    account: {
      type: string;
      nickname: string;
      rewards: number;
      balance: number;
    }
  ): Promise<{ code: number; message: string; objectCreated: NessieAccount }> {
    return this.request(`/customers/${customerId}/accounts`, {
      method: "POST",
      body: JSON.stringify(account),
    });
  }

  /**
   * Update an account
   */
  async updateAccount(
    accountId: string,
    updates: { nickname?: string; rewards?: number }
  ): Promise<{ code: number; message: string }> {
    return this.request(`/accounts/${accountId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete an account
   */
  async deleteAccount(
    accountId: string
  ): Promise<{ code: number; message: string }> {
    return this.request(`/accounts/${accountId}`, {
      method: "DELETE",
    });
  }

  // ==================== TRANSACTION OPERATIONS ====================

  /**
   * Get all transactions for an account
   */
  async getAccountTransactions(
    accountId: string
  ): Promise<NessieTransaction[]> {
    return this.request<NessieTransaction[]>(
      `/accounts/${accountId}/purchases`
    );
  }

  /**
   * Get a specific transaction
   */
  async getTransaction(transactionId: string): Promise<NessieTransaction> {
    return this.request<NessieTransaction>(`/purchases/${transactionId}`);
  }

  /**
   * Create a donation transaction (withdrawal)
   */
  async createDonation(
    accountId: string,
    donation: {
      merchant_id: string;
      medium: string;
      purchase_date: string;
      amount: number;
      description: string;
    }
  ): Promise<{
    code: number;
    message: string;
    objectCreated: NessieTransaction;
  }> {
    return this.request(`/accounts/${accountId}/purchases`, {
      method: "POST",
      body: JSON.stringify(donation),
    });
  }

  /**
   * Update a transaction
   */
  async updateTransaction(
    transactionId: string,
    updates: { medium?: string; description?: string }
  ): Promise<{ code: number; message: string }> {
    return this.request(`/purchases/${transactionId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete a transaction
   */
  async deleteTransaction(
    transactionId: string
  ): Promise<{ code: number; message: string }> {
    return this.request(`/purchases/${transactionId}`, {
      method: "DELETE",
    });
  }

  // ==================== TRANSFER OPERATIONS ====================

  /**
   * Transfer funds between accounts (for donation processing)
   */
  async transferFunds(
    accountId: string,
    transfer: NessieTransfer
  ): Promise<{
    code: number;
    message: string;
    objectCreated: NessieTransaction;
  }> {
    return this.request(`/accounts/${accountId}/transfers`, {
      method: "POST",
      body: JSON.stringify(transfer),
    });
  }

  /**
   * Get all transfers for an account
   */
  async getAccountTransfers(accountId: string): Promise<NessieTransaction[]> {
    return this.request<NessieTransaction[]>(
      `/accounts/${accountId}/transfers`
    );
  }

  // ==================== CUSTOMER OPERATIONS ====================

  /**
   * Get customer information
   */
  async getCustomer(customerId: string): Promise<NessieCustomer> {
    return this.request<NessieCustomer>(`/customers/${customerId}`);
  }

  /**
   * Get all customers
   */
  async getAllCustomers(): Promise<NessieCustomer[]> {
    return this.request<NessieCustomer[]>("/customers");
  }

  /**
   * Create a new customer (for donor/NGO registration)
   */
  async createCustomer(customer: {
    first_name: string;
    last_name: string;
    address: {
      street_number: string;
      street_name: string;
      city: string;
      state: string;
      zip: string;
    };
  }): Promise<{
    code: number;
    message: string;
    objectCreated: NessieCustomer;
  }> {
    return this.request("/customers", {
      method: "POST",
      body: JSON.stringify(customer),
    });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Process a donation from donor to NGO
   */
  async processDonation(
    donorAccountId: string,
    ngoAccountId: string,
    amount: number,
    description: string
  ): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    try {
      const transfer: NessieTransfer = {
        medium: "balance",
        payee_id: ngoAccountId,
        amount,
        transaction_date: new Date().toISOString(),
        description,
      };

      const result = await this.transferFunds(donorAccountId, transfer);

      return {
        success: true,
        transactionId: result.objectCreated._id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountId: string): Promise<number> {
    const account = await this.getAccount(accountId);
    return account.balance;
  }

  /**
   * Verify sufficient funds for donation
   */
  async verifySufficientFunds(
    accountId: string,
    amount: number
  ): Promise<boolean> {
    const balance = await this.getAccountBalance(accountId);
    return balance >= amount;
  }
}

// Export singleton instance
export const nessieClient = new NessieClient();

// Export class for custom instances
export default NessieClient;

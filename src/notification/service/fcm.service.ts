import { Inject, Injectable } from "@nestjs/common";
import * as admin from "firebase-admin";

// import * as serviceAccount from "../../service-account.json"; // Adjust the path as necessary
import { InjectRepository } from "@nestjs/typeorm";
import { Buyer } from "src/buyer/entity/buyer.entity";
import { Repository } from "typeorm";
import { BuyerToken } from "../entity/buyer-token.entity";
import { Seller } from "src/seller/entity/seller.entity";
import { SellerToken } from "../entity/seller-token.entity";

@Injectable()
export class FCMService {
  constructor(
    @InjectRepository(Buyer)
    private readonly buyerRepository: Repository<Buyer>,
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
    @InjectRepository(BuyerToken)
    private readonly buyerTokenRepository: Repository<BuyerToken>,
    @InjectRepository(SellerToken)
    private readonly sellerTokenRepository: Repository<SellerToken>
  ) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }

  async saveBuyerToken(buyerId: string, token: string): Promise<BuyerToken> {
    try {
      const buyer = await this.buyerRepository.findOneBy({ id: buyerId });
      if (!buyer) {
        throw new Error("User not found");
      }

      let buyerToken = new BuyerToken();
      buyerToken.buyer = buyer;

      buyerToken.token = token;
      return await this.buyerTokenRepository.save(buyerToken);
    } catch (error) {
      throw new Error(`Failed to save token: ${error.message}`);
    }
  }
  async saveSellerToken(sellerId: string, token: string): Promise<SellerToken> {
    try {
      const seller = await this.sellerRepository.findOneBy({ id: sellerId });
      if (!seller) {
        throw new Error("User not found");
      }

      let sellerToken = new SellerToken();
      sellerToken.seller = seller;

      sellerToken.token = token;
      return await this.sellerTokenRepository.save(sellerToken);
    } catch (error) {
      throw new Error(`Failed to save token: ${error.message}`);
    }
  }

  async sendNotificationByBuyerId(
    title: string,
    body: string,
    buyerId: string
  ) {
    try {
      const tokens = await this.buyerTokenRepository.find({
        where: { buyer: { id: buyerId } },
      });

      if (!tokens || tokens.length === 0) {
        return {
          success: false,
          message: "No tokens found for the user",
        };
      }

      console.log(tokens)

      const tokenList = tokens.map((t) => t.token).filter(Boolean);

      console.log(tokenList)

      const multicastMessage = {
        notification: {
          title,
          body,
        },
        tokens: tokenList,
      };

      console.log(multicastMessage)

      const response = await admin
        .messaging()
        .sendEachForMulticast(multicastMessage);


      console.log(response)

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendNotifTest() {
    const title = "YTES";
    const body = "gegegeg";
    const tokens = [
      "eGZGFM2ZSH2v7fXiJGChxZ:APA91bH1YNvU9u1t9aj16Z__CYr5c6EDaaE3SY_Kn_60tj4VXVZlrfdms2PTaBMDiB19nvbK--LCvmEzMvrU5oFLL9TgnqIKzBxOUma0lK1l4E_HNKp4YTA",
    ];
    try {
      const tokenList = tokens.filter(Boolean);

      console.log(tokenList);

      const multicastMessage = {
        notification: {
          title,
          body,
        },
        tokens: tokenList,
      };

      console.log(multicastMessage);

      const response = await admin
        .messaging()
        .sendEachForMulticast(multicastMessage);

      console.log(response);
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendNotificationBySellerId(
    title: string,
    body: string,
    sellerId: string
  ) {
    try {
      const tokens = await this.sellerTokenRepository.find({
        where: { seller: { id: sellerId } },
      });

      if (!tokens || tokens.length === 0) {
        return {
          success: false,
          message: "No tokens found for the user",
        };
      }

      const tokenList = tokens.map((t) => t.token).filter(Boolean);

      const multicastMessage = {
        notification: {
          title,
          body,
        },
        tokens: tokenList,
      };

      const response = await admin
        .messaging()
        .sendEachForMulticast(multicastMessage);

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // async sendNotification(token: string, title: string, body: string) {
  //   const message = {
  //     notification: {
  //       title,
  //       body,
  //     },
  //     token,
  //   };

  //   try {
  //     const response = await admin.messaging().send(message);
  //     return { success: true, response };
  //   } catch (error) {
  //     return { success: false, error };
  //   }
  // }
}

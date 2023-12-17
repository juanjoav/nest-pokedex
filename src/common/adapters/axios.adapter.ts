import { Injectable } from "@nestjs/common";
import { HttpAdapter } from "../interfaces/http-adapter.interface";
import axios from 'axios';

@Injectable()
export class AxiosAdapter implements HttpAdapter{

    private readonly axios = axios.create();

    async get<T>(url: string): Promise<T> {
        try{
            const { data } = await this.axios.get<T>(url);
            return data;
        } catch (error) {
            throw new Error('This is an error - AxiosAdapter');
        }
    }

}
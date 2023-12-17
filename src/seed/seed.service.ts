import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from '../common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  //private readonly axios = axios.create();

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,)
    {

  }

  async executeSeed() {

    await this.pokemonModel.deleteMany({}); // Esto es para borrar todos los registros de la base de datos

    const  data  = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );

    //const inserPromisesArray = [];
    const pokemonToInsert:{name:string, no:number}[] = [];

    data.results.forEach( ({ name, url }) => {
      const segments = url.split('/');
      const no:number = +segments[segments.length - 2];

      // await this.pokemonService.create({ no, name });

     // inserPromisesArray.push(this.pokemonModel.create({ no, name }));
      pokemonToInsert.push({ no, name });
      console.log({ no, name });
    });

    await this.pokemonModel.insertMany(pokemonToInsert);

    //await Promise.all(inserPromisesArray);

    return "seed executed";
  }
}

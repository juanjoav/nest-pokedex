import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);

      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll(paginationDto:PaginationDto) {

    const {limit = 5, offset = 0} = paginationDto;

    return this.pokemonModel.find().
    limit(limit)
    .skip(offset)
    .sort({no: 1})
    .select('-__v')

  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if (!isNaN(Number(+term))) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase() });
    }

    if (!pokemon) {
      throw new BadRequestException(`Pokemon "${term}" not found`);
    }

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    try {
      if (updatePokemonDto.name)
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
  //   const pokemon = await this.findOne(id);
  //  // this.pokemonModel.findByIdAndDelete(id);
  //  await pokemon.deleteOne();
  // return { id }
   // const result = await this.pokemonModel.findByIdAndDelete(id);
    const {deletedCount} = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon "${id}" not found`);
    }
    return;
  }

  private handleExceptions(error: any) {
      if (error.code === 11000) {
        throw new BadRequestException(
          `Pokemon already exists in the database ${JSON.stringify(
            error.keyValue,
          )})}`,
        );
      }
      console.error(error);
      throw new InternalServerErrorException("Can't create pokemon - Check the logs");
  }
}

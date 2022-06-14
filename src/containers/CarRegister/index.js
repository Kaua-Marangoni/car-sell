import { yupResolver } from "@hookform/resolvers/yup"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import toast, { Toaster } from "react-hot-toast"
import { GrUpload } from "react-icons/gr"
import { useNavigate } from "react-router-dom"
import * as Yup from "yup"

import { Button, ErrorMessage } from "../../components"
import { useUser } from "../../hooks/UserContext"
import api from "../../services/api"
import calcAge from "../../utils/getAge"
import { normalizePrice } from "../../utils/masks"
import {
  Container,
  ContainerItems,
  H1,
  Label,
  LabelUpload,
  FieldPrice,
  Input,
  Select
} from "./styles"

export function CarRegister() {
  const [categories, setCategories] = useState([])
  const [fileName, setFileName] = useState(null)
  const navigate = useNavigate()

  const { userData } = useUser()

  useEffect(() => {
    const fetchCars = async () => {
      const { data: categories } = await api.get("categories")

      categories.sort((x, y) => {
        return x.id - y.id
      })

      setCategories(categories)
    }

    fetchCars()
  }, [])

  const schema = Yup.object().shape({
    brand: Yup.string("Escreva uma marca válida").required(
      "A marca é obrigatória"
    ),
    model: Yup.string("Escreva um modelo válido").required(
      "O modelo é obrigatório"
    ),
    version: Yup.string("Escreva uma versão válida").required(
      "A versão é obrigatória"
    ),
    gear: Yup.string("Selecione uma transmissão válida").required(
      "A transmissão é obrigatória"
    ),
    year: Yup.string("Escreva um ano válido")
      .length(4, "Digite um ano válido")
      .required("O ano é obrigatório"),
    price: Yup.string("Escreva um preço válido").required(
      "O preço é obrigatório"
    ),
    km: Yup.string("Escreva uma quilometragem válida").required(
      "A quilometragem é obrigatória"
    ),
    description: Yup.string("Escreva uma descrição válida").required(
      "A descrição é obrigatória"
    ),
    category_id: Yup.string("Escolha uma categoria válida").required(
      "A categoria é obrigatória"
    ),
    file: Yup.mixed().test("required", "Carregue um arquivo", value => {
      return value && value.length > 0
    })
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })

  const priceValue = watch("price")

  useEffect(() => {
    setValue("price", normalizePrice(priceValue))
  }, [priceValue, setValue])

  const onSubmit = async clientData => {
    const carDataFormData = new FormData()

    carDataFormData.append("brand", clientData.brand)
    carDataFormData.append("model", clientData.model)
    carDataFormData.append("version", clientData.version)
    carDataFormData.append("gear", clientData.gear)
    carDataFormData.append("year", clientData.year)
    carDataFormData.append("price", clientData.price)
    carDataFormData.append("km", clientData.km)
    carDataFormData.append("description", clientData.description)
    carDataFormData.append("category_id", clientData.category_id)
    carDataFormData.append(
      "user_name",
      `${userData.name} ${userData.last_name}`
    )
    carDataFormData.append("user_email", userData.email)
    carDataFormData.append("user_number", userData.number)
    carDataFormData.append("user_state", userData.state)
    carDataFormData.append("user_city", userData.city)
    carDataFormData.append("user_allow_show_email", userData.allow_show_email)
    carDataFormData.append("file", clientData.file[0])

    if (calcAge(userData.birth_date) >= 18) {
      try {
        toast.loading("Anunciando", {
          duration: 5000
        })

        await api.post("cars", carDataFormData)

        toast.remove()
        toast.success(
          `${clientData.brand} ${clientData.model} anunciado com sucesso`,
          {
            duration: 2000
          }
        )

        setTimeout(() => {
          navigate("/")
        }, 1500)
      } catch (err) {
        toast.remove()
        toast.error("Falha no sistema, tente novamente")
      }
    } else {
      toast.error("Você não pode anunciar porque é menor de idade")
    }
  }

  return (
    <Container>
      <ContainerItems>
        <H1>Anuncie seu Veículo</H1>

        <Toaster />

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <span>
            <Label>Marca</Label>
            <Input
              type="text"
              placeholder="Ex: Nissan"
              {...register("brand")}
              error={errors.brand?.message}
            />
            <ErrorMessage>{errors.brand?.message}</ErrorMessage>
          </span>

          <span>
            <Label>Modelo</Label>
            <Input
              type="text"
              placeholder="Ex: GT-R"
              {...register("model")}
              error={errors.model?.message}
            />
            <ErrorMessage>{errors.model?.message}</ErrorMessage>
          </span>

          <span>
            <Label>Versão</Label>
            <Input
              type="text"
              placeholder="Ex: Nismo"
              {...register("version")}
              error={errors.version?.message}
            />
            <ErrorMessage>{errors.version?.message}</ErrorMessage>
          </span>

          <span>
            <Label>KM</Label>
            <Input
              type="number"
              placeholder="Ex: 7.500"
              {...register("km")}
              error={errors.km?.message}
            />
            <ErrorMessage>{errors.km?.message}</ErrorMessage>
          </span>

          <span>
            <Label>Ano</Label>
            <Input
              type="number"
              placeholder="Ex: 2017"
              {...register("year")}
              error={errors.year?.message}
            />
            <ErrorMessage>{errors.year?.message}</ErrorMessage>
          </span>

          <span>
            <Label>Câmbio</Label>
            <Select {...register("gear")} error={errors.gear?.message}>
              <option value="">Escolha a transmissão</option>
              <option value="Automático">Automático</option>
              <option value="Manual">Manual</option>
            </Select>
            <ErrorMessage>{errors.gear?.message}</ErrorMessage>
          </span>

          <span>
            <Label>Categoria</Label>
            <Select
              {...register("category_id")}
              error={errors.category_id?.message}
            >
              <option value="">Escolha a categoria</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <ErrorMessage>{errors.category_id?.message}</ErrorMessage>
          </span>

          <span>
            <Label>Preço</Label>
            <FieldPrice error={errors.price?.message}>
              <p>R$</p>
              <Input
                style={{
                  paddingLeft: 3,
                  background: "transparent",
                  border: "none"
                }}
                type="tel"
                placeholder="Ex: R$ 750.000,00"
                {...register("price")}
              />
            </FieldPrice>
            <ErrorMessage>{errors.price?.message}</ErrorMessage>
          </span>

          <span>
            <Label>Imagem</Label>
            <LabelUpload>
              {fileName || (
                <>
                  <GrUpload />
                  Escolha uma imagem do veículo
                </>
              )}
              <input
                type="file"
                accept="image/png, image/jpeg"
                {...register("file")}
                onChange={value => {
                  setFileName(value.target.files[0]?.name)
                }}
              />
            </LabelUpload>
            <ErrorMessage>{errors.file?.message}</ErrorMessage>
          </span>

          <span>
            <Label>Descrição</Label>
            <Input
              as="textarea"
              placeholder="Escreva um pouco sobre o veículo"
              {...register("description")}
              error={errors.description?.message}
              style={{ paddingTop: "3px", resize: "vertical" }}
            />
            <ErrorMessage>{errors.description?.message}</ErrorMessage>
          </span>

          <Button type="submit" style={{ margin: "25px 0 10px 0" }}>
            Anunciar
          </Button>
        </form>
      </ContainerItems>
    </Container>
  )
}
